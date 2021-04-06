import * as aws from "@pulumi/aws";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

export const bucketName = bucket.id;

const value = new aws.ssm.Parameter("myParam", {
    type: "String",
    value: "bar",
    name: "foo"
});

const docsHandlerRole = new aws.iam.Role("docsHandlerRole", {
    assumeRolePolicy: {
       Version: "2012-10-17",
       Statement: [{
          Action: "sts:AssumeRole",
          Principal: {
             Service: "lambda.amazonaws.com",
          },
          Effect: "Allow",
          Sid: "",
       }],
    },
 });

 new aws.iam.RolePolicyAttachment("lambda-ssm", {
     policyArn: aws.iam.ManagedPolicy.AmazonSSMFullAccess,
     role: docsHandlerRole
 });

 const ssm = new aws.sdk.SSM();

bucket.onObjectCreated("docHandler", new aws.lambda.CallbackFunction("function", {
    role: docsHandlerRole,
    callback: (e) => {
        
        var parameter = ssm.getParameter({
            Name: "foo"
        }).promise().then(x => console.log(`Parameter Value: ${x}`));
    }
}))
