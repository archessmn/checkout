
def imageTag = ''
def app

def label = "my-job-${UUID.randomUUID().toString()}"
echo "Using label ${label}"

nomadJobTemplate(
    label: label,
    taskGroups: [
      taskTemplate(
        name: 'jnlp',
        image: 'nazman/inbound-agent-docker:latest',
        resourcesMemory: 2048,
        resourcesCPU: 1000,
        envVars: [
            envVar(key: 'test', value: 'foobar'),
            envVar(key: 'test123', value: 'foobar456qsd'),
        ]
    )
  ]
)
{
  node(label) {
  stage('Prepare') {

    sh "pwd"
    sh "ls -a"
    sh "git clone https://github.com/archessmn/checkout.git ."
    sh "ls -a"
    // sh "cd checkout"
    sh "pwd"
    sh "ls -a"
    sh "git checkout ${env.BRANCH_NAME}"
      script {
        def imageNamePrefix = ''
        if (env.BRANCH_NAME != 'main') {
          imageNamePrefix = "${env.BRANCH_NAME}-"
        }
        imageTag = "${imageNamePrefix}${env.BUILD_NUMBER}"
      }
  }
  stage('Build Images') {
      script {
        app = docker.build('ghcr.io/archessmn/checkout')
      }
      // sh """docker build -t ghcr.io/archessmn/checkout:${imageTag} ."""
  }
  stage('Push') {
    // environment {
    //   GHCR_PAT = credentials("ghcr_access_token")
    // }
    when {
      anyOf {
        branch 'main'
        tag 'v*'
        changeRequest target: 'main'
      }
    }
      // sh "echo $GHCR_PAT | docker login ghcr.io -u archessmn --password-stdin"
      // sh "docker push ghcr.io/archessmn/checkout:${imageTag}"
      script {
        docker.withRegistry("https://ghcr.io", "ghcr_login") {
          app.push("${imageTag}")
          if (env.BRANCH_NAME == 'main') {
            app.push('latest')
          }
        }
      }
  }
  }
}