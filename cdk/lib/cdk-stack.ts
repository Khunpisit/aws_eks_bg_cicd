
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import ecr = require('@aws-cdk/aws-ecr');
import eks = require('@aws-cdk/aws-eks');
import iam = require('@aws-cdk/aws-iam');
import codebuild = require('@aws-cdk/aws-codebuild');
import codecommit = require('@aws-cdk/aws-codecommit');
import targets = require('@aws-cdk/aws-events-targets');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import {SecurityGroup} from '@aws-cdk/aws-ec2';

export class CdkStackALBEksBg extends cdk.Stack {
  private vpc: ec2.IVpc;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    this.vpc = ec2.Vpc.fromLookup(this, "Vpc", {
        vpcName: "dev-main-vpc"
    });

    const eksRole = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::995639774625:role/dev_main-core-eks-cluster-iam-role', {
      // Set 'mutable' to 'false' to use the role as-is and prevent adding new
      // policies to it. The default is 'true', which means the role may be
      // modified as part of the deployment.
      mutable: false,
    });


    /**
     * Create a new VPC with single NAT Gateway
     */
    // const vpc = new ec2.Vpc(this, 'NewVPC', {
    //   cidr: '10.0.0.0/16',
    //   natGateways: 1
    // });

    // const clusterAdmin = new iam.Role(this, 'AdminRole', {
    //   assumedBy: new iam.AccountRootPrincipal()
    // });

    // const cluster = new eks.Cluster(this, 'Cluster', {
    //   vpc,
    //   defaultCapacity: 2,
    //   mastersRole: clusterAdmin,
    //   outputClusterName: true,
    // });

    // const cluster = eks.Cluster.fromClusterAttributes(this, 'MyCluster', {
    //   clusterName: 'dev_main-core-eks-cluster',
    //   kubectlRoleArn: 'arn:aws:iam::995639774625:role/dev_main-core-eks-cluster-iam-role',
    //   // kubectlSecurityGroupId: ['sg-03b7f386b275b7f04'],
    //   // kubectlPrivateSubnetIds: ['sg-03b7f386b275b7f04', 'sg-03b7f386b275b7f04', 'subnet-03c455e100003032c', 'subnet-0145337f54a0cd25d']
    // });

    const secGroup = SecurityGroup.fromSecurityGroupId(this, 'SG', 'sg-03b7f386b275b7f04', {
      mutable: false
   });

    const cluster = eks.Cluster.fromClusterAttributes(this, 'MyCluster', {
      vpc: this.vpc,
      clusterName: 'dev_main-core-eks-cluster',
      clusterArn: 'arn:aws:eks:ap-southeast-1:995639774625:cluster/dev_main-core-eks-cluster',
      clusterEndpoint: 'https://316AC65E3F9B0981407866239EABFFC6.yl4.ap-southeast-1.eks.amazonaws.com',
      clusterCertificateAuthorityData: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5RENDQWJDZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQjRYRFRJd01EZ3lNREEyTkRreE1sb1hEVE13TURneE9EQTJORGt4TWxvd0ZURVRNQkVHQTFVRQpBeE1LYTNWaVpYSnVaWFJsY3pDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTWp4CnYwcS9NZ2lPYnpLcDBCUTB1a3lhYlhsSm9WVlFMek0zaVgzeVYwbzIwUktFYW9hYUQzbXlPWlNkNjhzWTkxKzkKcmx2Y2FRdEM3MzBwSDNvdU9CMVBBR1U4RU5WRzAxdVJtQXhXNEpYOUs4T0UxenNEeThRNHlrMEdQSXVzVTlzbQpqdU5uTWF2WitSL0pqaEtneEtpSy9WaUxGeGd1cTNOWnhnVGluV1dVdXBDMmg1N243ckVadVNwdjBnNVdBSjIxClk4dUxtWnJKSmlaTHBQeXp3ODUzUW1BNnppM1JkUnpNMGZYcHhJZ3gvSnZLTlNuUkw0RU5xUDJKYmRPczJrMWoKZ2lNaEg5L2ZETm9Jd0tMUDZBK2s4a21hcUJpTlBlMFNEQWZUT2V3aHNOSi9sYko0MG9JVFp4ODlwc2o1WmxkYQpzamdFZVdIeUpFWFBYNitqR2ZjQ0F3RUFBYU1qTUNFd0RnWURWUjBQQVFIL0JBUURBZ0trTUE4R0ExVWRFd0VCCi93UUZNQU1CQWY4d0RRWUpLb1pJaHZjTkFRRUxCUUFEZ2dFQkFLNmRKYkxWelFxeUtZZDdEcHRFZVFZcEhibkcKMlRxeFh2Szg5dUdQTWZvdGFOYUFUNEpHamxJUlUwZk83ZFRqTllsTnFyWHoyWVAyVkVzWVRLcW9ZaDZUU0RMYgpqdkxKNXpydHhqVUVYSkgxSjlHckpDS2ZRdlpNZjk1YW5KUnB3TjF5K1FROG54YVBQN20wRVRDYWdaM2h3SUd1CkwwdUFpWmtLMlp2L2tDeDllTzJsMmFreDhoUFlVYkovT2hqT01OQzJsMjZvWjQvYUZFOTBKMUxrcU5TTWdsMWoKZ2VQNHN1REFDWjc1YTkvSyt3V2tSYm5ROGh6S2d2QTJOaEdyR3pjSForeUlBYWZ2M2FadTFMZ01LVCtYZ005TgpLQnlzZ2lqRzFTVk1CSWtiQlFPUlJjeDB3ZmZQeUh2dm5nK1ZOMWduM0JlelhzYnRHcThtZFF1d3NHMD0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=',
      securityGroups: [secGroup]
    });

  const clusterProps = {
      vpc: this.vpc,
      role: eksRole,
      clusterName: 'dev_main-core-eks-cluster',
      defaultCapacity: 0
  };
  
  // const cluster = new eks.Cluster(this, 'dev_main-core-eks-cluster', clusterProps);
  const ecrRepo = new ecr.Repository(this, 'EcrRepo');

  const repository = new codecommit.Repository(this, 'CodeCommitRepo', {
    repositoryName: `${this.stackName}-repo`
  });

    // CODEBUILD - project
    const project = new codebuild.Project(this, 'MyProject', {
      projectName: `${this.stackName}`,
      source: codebuild.Source.codeCommit({ repository }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.fromAsset(this, 'CustomImage', {
          directory: '../dockerAssets.d',
        }),
        privileged: true
      },
      environmentVariables: {
        'CLUSTER_NAME': {
          value: `${cluster.clusterName}`
        },
        'ECR_REPO_URI': {
          value: `${ecrRepo.repositoryUri}`
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: [
              'env',
              'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}',
              '/usr/local/bin/entrypoint.sh'
            ]
          },
          build: {
            commands: [
              'cd flask-docker-app',
              `docker build -t $ECR_REPO_URI:$TAG .`,
              '$(aws ecr get-login --no-include-email)',
              'docker push $ECR_REPO_URI:$TAG'
            ]
          },
          post_build: {
            commands: [
              'kubectl get nodes -n flask-alb',
              'kubectl get deploy -n flask-alb',
              'kubectl get svc -n flask-alb',
              "isDeployed=$(kubectl get deploy -n flask-alb -o json | jq '.items[0]')",
              "deploy8080=$(kubectl get svc -n flask-alb -o wide | grep 8080: | tr ' ' '\n' | grep app= | sed 's/app=//g')",
              "echo $isDeployed $deploy8080",
              "if [[ \"$isDeployed\" == \"null\" ]]; then kubectl apply -f k8s/flaskALBBlue.yaml && kubectl apply -f k8s/flaskALBGreen.yaml; else kubectl set image deployment/$deploy8080 -n flask-alb flask=$ECR_REPO_URI:$TAG; fi",
              'kubectl get deploy -n flask-alb',
              'kubectl get svc -n flask-alb'
            ]
          }
        }
      })
    })




    // CODEBUILD - project2
    const project2 = new codebuild.Project(this, 'MyProject2', {
      projectName: `${this.stackName}2`,
      source: codebuild.Source.codeCommit({ repository }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.fromAsset(this, 'CustomImage2', {
          directory: '../dockerAssets.d',
        }),
        privileged: true
      },
      environmentVariables: {
        'CLUSTER_NAME': {
          value: `${cluster.clusterName}`
        },
        'ECR_REPO_URI': {
          value: `${ecrRepo.repositoryUri}`
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: [
              'env',
              'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}',
              '/usr/local/bin/entrypoint.sh'
            ]
          },
          build: {
            commands: [
              'cd flask-docker-app',
              'echo "Dummy Action"'
            ]
          },
          post_build: {
            commands: [
              'kubectl get nodes -n flask-alb',
              'kubectl get deploy -n flask-alb',
              'kubectl get svc -n flask-alb',
              "deploy8080=$(kubectl get svc -n flask-alb -o wide | grep ' 8080:' | tr ' ' '\n' | grep app= | sed 's/app=//g')",
              "deploy80=$(kubectl get svc -n flask-alb -o wide | grep ' 80:' | tr ' ' '\n' | grep app= | sed 's/app=//g')",
              "echo $deploy80 $deploy8080",
              "kubectl patch svc flask-svc-alb-blue -n flask-alb -p '{\"spec\":{\"selector\": {\"app\": \"'$deploy8080'\"}}}'",
              "kubectl patch svc flask-svc-alb-green -n flask-alb -p '{\"spec\":{\"selector\": {\"app\": \"'$deploy80'\"}}}'",
              'kubectl get deploy -n flask-alb',
              'kubectl get svc -n flask-alb'
            ]
          }
        }
      })
    })





    // PIPELINE

    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository,
      output: sourceOutput,
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [new codepipeline.Artifact()], // optional
    });


    const buildAction2 = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project2,
      input: sourceOutput,
    });


    const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve',
    });



    new codepipeline.Pipeline(this, 'MyPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'BuildAndDeploy',
          actions: [buildAction],
        },
        {
          stageName: 'ApproveSwapBG',
          actions: [manualApprovalAction],
        },
        {
          stageName: 'SwapBG',
          actions: [buildAction2],
        },
      ],
    });


    repository.onCommit('OnCommit', {
      target: new targets.CodeBuildProject(codebuild.Project.fromProjectArn(this, 'OnCommitEvent', project.projectArn))
    });

    ecrRepo.grantPullPush(project.role!)
    // cluster.awsAuth.addMastersRole(project.role!)
    project.addToRolePolicy(new iam.PolicyStatement({
      actions: ['eks:DescribeCluster'],
      resources: [`${cluster.clusterArn}`],
    }))


    ecrRepo.grantPullPush(project2.role!)
    // cluster.awsAuth.addMastersRole(project2.role!)
    project2.addToRolePolicy(new iam.PolicyStatement({
      actions: ['eks:DescribeCluster'],
      resources: [`${cluster.clusterArn}`],
    }))


    new cdk.CfnOutput(this, 'CodeCommitRepoName', { value: `${repository.repositoryName}` })
    new cdk.CfnOutput(this, 'CodeCommitRepoArn', { value: `${repository.repositoryArn}` })
    new cdk.CfnOutput(this, 'CodeCommitCloneUrlSsh', { value: `${repository.repositoryCloneUrlSsh}` })
    new cdk.CfnOutput(this, 'CodeCommitCloneUrlHttp', { value: `${repository.repositoryCloneUrlHttp}` })
  }
}
