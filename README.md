# SESEmailForward
Amazon SES Email Forward to Your Inbox

### Deployment

- Create a new cloudformation stack using the file `SESEmailForward.yml`
- Give the stack a name
- Enter the from email and to email parameters
- Create the stack
- In SES under receiving create a new rule which forwards the required emails to the SNS topic created by the stack (select UTF encoding)

### Created services
- SNS Topic to forward received emails from SES
- IAM Role to invoke Lambda function from SNS
- Lambda function with NodeJS code to forward the emails to a defined address
- IAM Role allowing Lambda to forward emails.
