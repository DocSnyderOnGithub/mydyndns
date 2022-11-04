# mydyndns
Update DNS entry on Route 53 via Lambda and API Gateway.

Same idea (with more detailed description but also more synology-specific): https://www.synoforum.com/resources/ddns-with-aws-lambda-and-route53.25/

Step 1: Configure Route53

    Go to: Services > Route53
    Select the domain you want to use (or create a new one).
    Find your Hosted Zone ID Under the column “Hosted Zone ID”
    Keep a note of this ID, you’ll need it later.

Step 2: Configure IAM

    We need to create an IAM ‘Role’ to allow Lambda to access Route53 and update the DNS records.
    
    Login to AWS
    Go to: Services > IAM
    Click “Roles”
    Click “Create Role”
    Under “Select type of trusted entity” choose “Lambda”
    Click “Next: Permissions”
    Search for “Lambda”
    Check “AWSLambdaBasicExecutionRole” (this adds logging permissions)
    Search for “Route53”
    Check “AmazonRoute53FullAccess” (actually it is better to create a Policy that only allows changing the desired Rout53 zone by ID from step 1)
    Click “Next: Tags”
    You can skip this step and click “Next: Review”
    Give the Role a name under “Role name*”
    Click “Create role”

Step 3.1: Create a new Lambda function

    Login to AWS
    Go to: Services > Lambda
    Click “Create function”
    Select “Author from scratch”
    Fill in the “Function name” field with whatever name you like
    Select newest "Node.js x.y" from “Runtime”
    Open the dropdown “Choose or create an execution role”
    Under “Execution role” select “Use an existing role”
    Under “Existing role” choose the role you created in Step 2
    Click “Create function”.

Step 3.2: Add your function’s code

    At the top of your functions page select the function name
    The code editor should appear, scroll down and add code from "index.js" when you want to use GET parameters or "index-post.js" when you can use POST. 
    At the top of the page, click “Save”
    
    Define Environment variables to use in function:
    “USERNAME” – Make a new random username
    “PASSWORD” – Make a new random password
    “ZONEID” – You should have saved this from Step 1.
    “HOSTNAME” – Choose host name to update.
    At the top of the page, click “Save”

Step 4: Either add "Function URL" (new in 2022) or API Gateway

Step 4a (URL):
    Click "add funtion URL" in Lambda.
    Yes, that makes things a lot easier...
    
Step 4b (Gateway): 
    Add a Trigger

    In the “Designer” component select “Add trigger”
    Under "Trigger configuration", select "API Gateway”.
    Under “Intent”, select “Create a new API”
    API type should be HTTP API
    Under “Security” select “Open”
    Click “Add”

    Copy your function’s API endpoint

    You should now be back at your function screen. If not, go to Lambda > Functions > Function-Name
    Click on “API Gateway”
    Scroll down to the bottom and copy your “API endpoint”, you’ll need this later.

Step 5: Configure Custom DDNS Provider in Router / whatever client

    Using GET method:
    Under Query URL paste in your "API endpoint" (API Gateway) or "Function URL" (Lambda) from Step 4
    Add the following query params to the end of the “API endpoint” URI:

    Code: ?ipaddr=__MYIP__&username=__USERNAME__&password=__PASSWORD__
    
    Using POST method:
    Just define your parameters to be POSTed. Using curl this would look like 

    Code: curl -X POST -H 'Content-type: application/json' --data '{"username": "x", "password": "y", "ipaddr": "1.2.3.4" }' https://<randomID>.lambda-url.<region>.on.aws

