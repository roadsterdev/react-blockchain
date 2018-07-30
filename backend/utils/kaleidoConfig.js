const request = require("request-promise");
const fs = require("fs");

class kaleidoConfig {

    // Declare some constants that we need to create kaleido platform
    constructor() {
        this.baseUrl = "https://console.kaleido.io/api/v1";
        this.locale = "";

        this.consortiumName = "KaleidoKards-SampleApp";
        this.consortiumDescription = "Sample application for Blockchain 101";

        this.environmentName = "KaleidoKards Environment";
        this.environmentProvider = "geth";
        this.environmentConsensusType = "poa";

        this.ethAmount = "100";

        this.memberUser = "user";
        this.memberJoe = "joe";
        this.memberStore = "kard_store";

        this.nodeUser = "user_node";
        this.nodeJoe = "joe_node";
        this.nodeStore = "kard_store_node";

        this.token = "";
        this.contractAddress = "";
        this.consortiaId = "";
        this.environmentId = "";

        this.previousInstance = false;

        this.userNodeUrls = {};
        this.userNodeUser = "";
        this.userNodePass ="";

        this.joeNodeUrls = {};
        this.joeNodeUser = "";
        this.joeNodePass = "";

        this.storeNodeUrls = {};
        this.storeNodeUser = "";
        this.storeNodePass = "";
    }

    // Closely follows https://console.kaleido.io/docs/docs/api101/
    // This may seem like a big and scary function but it's really just nested promises
    // Flow is: Create Consortia > Environment > Memberships > Nodes > Generate AppCreds > Fund Accounts
    // Should only be called if a keyfile for an existing KaleidoKards environment does not exist
    launch() {
        // Depends on a valid JWT token being set on this.token by calling getJWTtoken and setting field
        this.headers = {"Authorization":"Bearer " + this.token, "Content-Type":"application/json"};
        console.log("Creating Consortia");
        return this.createConsortia().then((response) => {
            let jsonResponse = JSON.parse(response);
            let consortia = jsonResponse._id;
            this.consortiaId = consortia;
            console.log("Created consortium with ID: " + consortia);
            console.log("Creating Environment");
            return this.createEnvironment(consortia).then((response) => {
                let jsonResponse = JSON.parse(response);
                let environment = jsonResponse._id;
                this.environmentId = environment;
                console.log("Created environment with ID: " + environment);
                console.log("Creating Memberships");
                // Create the 3 memberships at once
                let createAllMemberships = Promise.all([
                    this.createMembership(consortia, this.memberUser),
                    this.createMembership(consortia, this.memberJoe),
                    this.createMembership(consortia, this.memberStore)]);
                return createAllMemberships.then((response) => {
                    // Promise.all returns the responses for each call in an array
                    let userResponse  = JSON.parse(response[0]);
                    let joeResponse   = JSON.parse(response[1]);
                    let storeResponse = JSON.parse(response[2]);

                    let userMember = userResponse._id;
                    let joeMember = joeResponse._id;
                    let storeMember = storeResponse._id;
                    console.log("Created all memberships");
                    console.log("Creating nodes");
                    // Create the 3 nodes at once
                    let createAllNodes = Promise.all([
                        this.createNode(consortia, environment, userMember, this.nodeUser),
                        this.createNode(consortia, environment, joeMember, this.nodeJoe),
                        this.createNode(consortia, environment, storeMember, this.nodeStore)]);
                    return createAllNodes.then((response) => {
                        let userResponse  = JSON.parse(response[0]);
                        let joeResponse   = JSON.parse(response[1]);
                        let storeResponse = JSON.parse(response[2]);

                        //Wait on all the nodes to be initialized then get their status
                        let waitForAllNodes = Promise.all([
                            this.waitForNodeInitialization(consortia, environment, userResponse._id),
                            this.waitForNodeInitialization(consortia, environment, joeResponse._id),
                            this.waitForNodeInitialization(consortia, environment, storeResponse._id)]);
                        return waitForAllNodes.then((response) => {
                            let userNodeStatus  = response[0];
                            let joeNodeStatus   = response[1];
                            let storeNodeStatus = response[2];

                            // Get the urls to communicate with the nodes
                            this.userNodeUrls  = userNodeStatus.urls;
                            this.joeNodeUrls   = joeNodeStatus.urls;
                            this.storeNodeUrls = storeNodeStatus.urls;
                            console.log("Created and Initialized Nodes");
                            console.log("Generating app credentials");
                            let createAllAppCreds = Promise.all([
                                this.generateAppCredentials(consortia, environment, userMember),
                                this.generateAppCredentials(consortia, environment, joeMember),
                                this.generateAppCredentials(consortia, environment, storeMember)])
                            return createAllAppCreds.then((response) => {
                                let userNodeStatus  = JSON.parse(response[0]);
                                let joeNodeStatus   = JSON.parse(response[1]);
                                let storeNodeStatus = JSON.parse(response[2]);

                                this.userNodeUser = userNodeStatus.username;
                                this.userNodePass = userNodeStatus.password;

                                this.joeNodeUser = joeNodeStatus.username;
                                this.joeNodePass = joeNodeStatus.password;

                                this.storeNodeUser = storeNodeStatus.username;
                                this.storeNodePass = storeNodeStatus.password;
                                console.log("App Credentials generated");
                                console.log("Getting Node account addresses for funding");

                                let getAllNodeStatuses = Promise.all([
                                    this.getNodeStatus(consortia, environment, userResponse._id),
                                    this.getNodeStatus(consortia, environment, joeResponse._id)]);
                                return getAllNodeStatuses.then((response) => {
                                    userNodeStatus = JSON.parse(response[0]);
                                    joeNodeStatus = JSON.parse(response[1]);

                                    let userAddress = userNodeStatus.user_accounts[0];
                                    let joeAddress = joeNodeStatus.user_accounts[0];
                                    console.log("Received account addresses");
                                    console.log("Funding accounts");
                                    let fundAccounts = Promise.all([
                                        this.fundAccount(consortia, environment, userAddress),
                                        this.fundAccount(consortia, environment, joeAddress)]);
                                    return fundAccounts.then((receipts) => {
                                        // receipts is the transaction receipts from funding the accounts
                                        console.log("Accounts funded, Writing keyfile");
                                        // Finally, we have everything created and all the creds we need to make some magic
                                        // So lets write them to a file for later use
                                        this.writeKeyFile();
                                        return this;
                                    })
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    // Gets a JWT token for auth to use instead of the API key for every call
    // Internally, we swap the API key for a JWT token and this
    // can cause longer wait times if every call uses an API key instead of a JWT token
    // Returns a promise object containing a JWT token good for an hour
    getJWTToken(apiKey) {
        let headers = {"Authorization":"Bearer " + apiKey, "Content-Type":"application/json"};
        let body = JSON.stringify({apikey: apiKey});
        let uri = this.baseUrl + "/authtoken";
        let options = {method: 'POST', uri: uri, headers: headers, body: body};
        return request(options);
    }

    // Returns a promise object containing true if under consortia limit for the user's plan
    // false if at/over consortia limit for the user's plan
    checkConsortiaLimit() {
        let headers = {"Authorization":"Bearer " + this.token, "Content-Type":"application/json"};
        let uri = this.baseUrl + "/consortia";
        let options = {method: 'GET', uri: uri, headers: headers};
        return request(options).then((response) => {
            let consortia = JSON.parse(response);
            let consortiaNum = consortia.length;
            // check if we have less than the default plan
            if (consortiaNum < 2) {
                return true;
            }

            // else we need to see how many we can have
            let uri = this.baseUrl + "/orgs";
            let options = {method: 'GET', uri: uri, headers: headers};
            return request(options).then((response) => {
               let parsedResponse = JSON.parse(response);
               let plan = parsedResponse[0].plan;
               uri = this.baseUrl + "/plans/" + plan;
               options = {method: 'GET', uri: uri, headers: headers};
               return request(options).then((response) => {
                   let parsedResponse = JSON.parse(response);
                   let consortiaLimit = parsedResponse.limits.consortia.per.org;

                   return consortiaNum < consortiaLimit;
               });
            });
        })


    }

    // Creates a new Consortium on Kaleido
    // Returns promise object containing consortia details
    createConsortia() {
        let body = JSON.stringify({name: this.consortiumName, description: this.consortiumDescription});
        let uri = this.baseUrl + "/consortia";
        let options = {method: 'POST', uri: uri, headers: this.headers, body: body};
        return request(options);
    }

    // Creates a new Environment within the given consortia
    // Returns promise object containing environment details
    createEnvironment(consortium){
        let body = JSON.stringify({name: this.environmentName, provider: this.environmentProvider, consensus_type: this.environmentConsensusType});
        let uri = this.baseUrl + "/consortia/" + consortium + "/environments";
        let options = {method: 'POST', uri: uri, headers: this.headers, body: body};
        return request(options);
    }

    // Creates a new membership within the consortium with the given orgName
    // Returns promise object containing membership details
    createMembership(consortium, orgName){
        let body = JSON.stringify({org_name: orgName});
        let uri = this.baseUrl + /consortia/ + consortium + "/memberships";
        let options = {method: 'POST', uri: uri, headers: this.headers, body: body};
        return request(options);
    }

    // Creates a new node within the given consortium/environment for the given membershipId
    // Returns a promise object containing node details
    // NOTE: Node may not be initialized yet
    createNode(consortium, environment, membershipId, name) {
        let body = JSON.stringify({membership_id: membershipId, name: name});
        let uri = this.baseUrl + /consortia/ + consortium + "/environments/" + environment + "/nodes";
        let options = {method: 'POST', uri: uri, headers: this.headers, body: body};
        return request(options);
    }

    // Waits on the given node to finish initializing before returning the new node details
    // Returns promise object containing the node details
    async waitForNodeInitialization(consortium, environment, node) {
        let uri = this.baseUrl + /consortia/ + consortium + "/environments/" + environment + "/nodes/" + node;
        let options = {method: 'GET', uri: uri, headers: this.headers};
        let state = "initializing";
        let jsonResponse;
        while (state === "initializing") {
            let response = await request(options);
            jsonResponse = JSON.parse(response);
            state = jsonResponse.state;
            // Wait 3 seconds so we don't spam the API
            console.log("Waiting on Node initialization: " + node);
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        return jsonResponse;
    }

    // Returns a promise object containing the node status and details
    getNodeStatus(consortium, environment, node) {
        let uri = this.baseUrl + /consortia/ + consortium + "/environments/" + environment + "/nodes/" + node + "/status";
        let options = {method: 'GET', uri: uri, headers: this.headers};
        return request(options);
    }

    // Generates new app credentials for a given node
    // Returns a promise object containing the username and password
    generateAppCredentials(consortium, environment, membershipId){
        let body = JSON.stringify({membership_id: membershipId});
        let uri = this.baseUrl + /consortia/ + consortium + "/environments/" + environment + "/appcreds";
        let options = {method: 'POST', uri: uri, headers: this.headers, body: body};
        return request(options);
    }

    // Sends ether from the ether pool to the given account address
    // Returns a promise object containing a tx receipt i think
    fundAccount(consortium, environment, address) {
        let body = JSON.stringify({account: address, amount: this.ethAmount});
        let uri = this.baseUrl + /consortia/ + consortium + "/environments/" + environment + "/eth/fundaccount";
        let options = {method: 'POST', uri: uri, headers: this.headers, body: body};
        return request(options);
    }

    // Writes a file to <project_root>/.data/keyfile.json for storing app credentials
    // This directory was chose because Glitch.com uses this dir for private storage
    writeKeyFile() {
        const fs = require("fs");

        let keys = {
            locale: this.locale,
            consortia: this.consortiaId,
            environment: this.environmentId,
            contractAddress: this.contractAddress,
            user_node: {urls: this.userNodeUrls, username: this.userNodeUser, password: this.userNodePass},
            joe_node: {urls: this.joeNodeUrls, username: this.joeNodeUser, password: this.joeNodePass},
            kard_store_node: {urls: this.storeNodeUrls, username: this.storeNodeUser, password: this.storeNodePass}
        };

        let data = JSON.stringify(keys);
        // If the directory doesn't exist, lets create it
        let dir = __dirname + "/../../.data";
        !fs.existsSync(dir) && fs.mkdirSync(dir);

        let filepath = dir + "/keystore.json";
        fs.writeFileSync(filepath, data);
        this.previousInstance = true;
    }

}

module.exports = kaleidoConfig;
