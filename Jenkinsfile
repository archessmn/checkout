
def imageTag = ''
def app
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
        script {
          app = docker.build('ghcr.io/archessmn/checkout')
        }
        // sh """docker build -t ghcr.io/archessmn/checkout:${imageTag} ."""
      }
    }
    stage('Push') {
      // when {
      //   anyOf {
      //     branch 'main'
      //     tag 'v*'
      //     changeRequest target: 'main'
      //   }
      // }
      steps {
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