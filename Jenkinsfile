
def imageTag = ''
pipeline{
  agent{
      label "docker"
  }
  stages{
    stage('Prepare') {
      steps {
        script {
          def imageNamePrefix = ''
          if (env.BRANCH_NAME != 'main') {
            imageNamePrefix = "${env.BRANCH_NAME}-"
          }
          imageTag = "${imageNamePrefix}${env.BUILD_NUMBER}"
        }
      }
    }
    stage('Build Images') {
      steps {
        sh """docker build -t ghcr.io/archessmn/checkout:${imageTag} ."""
      }
    }
    stage('Push') {
      environment {
        GHCR_PAT = credentials("ghcr_access_token")
      }
      when {
        anyOf {
          branch 'main'
          tag 'v*'
          changeRequest target: 'main'
        }
      }
      steps {
        sh "echo $GHCR_PAT | docker login ghcr.io -u archessmn --password-stdin"
        dockerPush image: 'ghcr.io/archessmn/checkout', tag: imageTag
      }
    }
  }
  post{
    always{
      echo "========always========"
    }
    success{
      echo "========pipeline executed successfully ========"
    }
    failure{
      echo "========pipeline execution failed========"
    }
  }
}