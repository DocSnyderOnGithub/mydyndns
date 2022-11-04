# mydyndns
Update DNS entry on Route 53 via Lambda and API Gateway.

Same idea (with more detailed description but also more synology-specific): https://www.synoforum.com/resources/ddns-with-aws-lambda-and-route53.25/


Step 1: Configure IAM

    We need to create an IAM ‘Role’ to allow Lambda to access Route53 and update the DNS records.
    
    Login to AWS
    Go to: Services > IAM
    Click “Roles”
    Click “Create Role”
    Under “Select type of trusted entity” choose “Lambda”
    Click “Next: Permissions”
    Search for “Route53”
    Check “AmazonRoute53FullAccess”
    Search for “Lambda”
    Check “AWSLambdaBasicExecutionRole”
    Click “Next: Tags”
    Skip this step and click “Next: Review”
    Give the Role a name under “Role name*”
    Click “Create role”

Step 2: Configure Route53

    Go to: Services > Route53
    Select the domain you want to use.
    Find your Hosted Zone ID Under the column “Hosted Zone ID”
    Keep a note of this ID, you’ll need it later.

Step 3.1: Create a new Lambda function

    Login to AWS
    Go to: Services > Lambda
    Click “Create function”
    Select “Author from scratch”
    Fill in the “Function name” field with whatever name you like
    Select Node.js 10.x from “Runtime”
    Open the dropdown “Choose or create an execution role”
    Under “Execution role” select “Use an existing role”
    Under “Existing role” choose the role you created in Step 1
    Click “Create function”.

Step 3.2: Add your function’s code

    At the top of your functions page select the function name
    The code editor should appear, scroll down and add code from “index.js”
    At the top of the page, click “Save”
    
    Define Environment variables to use in function:
    “USERNAME” – Make a new random username
    “PASSWORD” – Make a new random password
    “ZONEID” – You should have saved this from Step 2.
    “HOSTNAME” – Choose host name.
    At the top of the page, click “Save”

Step 4: Either add "Function URL" (new in 2022) or API Gateway

Step 4a (URL):
    Click add "Funtion URL" in Lambda
    
Step 4b (Gateway): 
    Add a Trigger

    In the “Designer” component select “Add trigger”
    Under “Select a trigger”, select “API Gateway” (it should be the first in the list).
    Under “API”, select “Create a new API”
    Under “Security” select “Open”
    Click “Add”

    Copy your function’s API endpoint

    You should now be back at your function screen. If not, go to Lambda > Functions > Function-Name
    Click on “API Gateway”
    Scroll down to the bottom and copy your “API endpoint”, you’ll need this later.

Step 5: Configure Custom DDNS Provider in Router / whatever client

    Under Query URL paste in your “API endpoint” from Step 3.3
    Add the following query params to the end of the “API endpoint” URI:

    Code: ?ipaddr=__MYIP__&username=__USERNAME__&password=__PASSWORD__
