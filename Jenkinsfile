pipeline {
    agent any

    environment {
        DOCKERHUB_ACCOUNT = 'ak2267'  
        PATH = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"  
        DOCKER_HOST = "unix:///Users/adarshkumar/.docker/run/docker.sock"  
        DOCKER_CONTEXT = "desktop-linux"  
        HOME = "/Users/adarshkumar"  
        JIRA_SITE = 'f21ao-group5.atlassian.net'  
    }

    stages {
        stage('Debug Environment') {
            steps {
                sh '''
                    echo "Current PATH: $PATH"
                    echo "Docker location: $(which docker)"
                    echo "Docker version: $(docker --version)"
                    echo "Docker socket exists: $(test -S /Users/adarshkumar/.docker/run/docker.sock && echo "Yes" || echo "No")"
                    echo "Docker context: $(docker context ls)"
                '''
            }
        }

        stage('Checkout Repository') {
            steps {
                git url: 'https://github.com/F21AO-Group5/Devops-Group5.git', branch: 'main'
            }
        }

        stage('Run Tests') {
            environment {
                NODE_ENV = 'test'
                MONGO_URI = 'mongodb://localhost:27018/test'
                JWT_SECRET = 'test-secret'
            }
            steps {
                script {
                    sh '''
                        echo "Cleaning up any existing test containers..."
                        docker rm -f mongodb-test || true
                        
                        echo "Starting MongoDB container for testing..."
                        docker run -d --name mongodb-test -p 27018:27017 mongo:latest
                        
                        # Wait for MongoDB to be ready
                        echo "Waiting for MongoDB to start..."
                        for i in $(seq 1 30); do
                            if docker exec mongodb-test mongosh --eval "db.stats()" > /dev/null 2>&1; then
                                echo "MongoDB is ready!"
                                break
                            fi
                            if [ $i -eq 30 ]; then
                                echo "Error: MongoDB failed to start"
                                exit 1
                            fi
                            echo "Waiting... ($i/30)"
                            sleep 1
                        done
                    '''
                    
                    // Run User Service Tests
                    dir('user-service') {
                        sh '''
                            echo "Installing dependencies for user-service..."
                            npm install
                            
                            # Install specific version of test reporter and required dependencies
                            npm install --save-dev mocha@9.2.2 mocha-junit-reporter@2.2.0 chai@4.3.7 chai-http@4.3.0
                            
                            echo "Running user-service tests..."
                            export NODE_ENV=test
                            export MOCHA_FILE="test-results.xml"
                            export MONGO_URI="mongodb://localhost:27018/user-service-test"
                            export JWT_SECRET="test-secret"
                            
                            # Ensure mocha has execute permissions
                            chmod +x node_modules/.bin/mocha
                            
                            npx mocha \
                                --recursive \
                                --timeout 5000 \
                                --reporter mocha-junit-reporter \
                                --reporter-options mochaFile=./test-results.xml \
                                --exit \
                                "./test/**/**.test.js" || exit 1
                        '''
                    }

                    // Run Patient Service Tests
                    dir('patient-service') {
                        sh '''
                            echo "Installing dependencies for patient-service..."
                            npm install
                            
                            # Install specific version of test reporter and required dependencies
                            npm install --save-dev mocha@9.2.2 mocha-junit-reporter@2.2.0 chai@4.3.7 chai-http@4.3.0
                            
                            echo "Running patient-service tests..."
                            export NODE_ENV=test
                            export MOCHA_FILE="test-results.xml"
                            export MONGO_URI="mongodb://localhost:27018/patient-service-test"
                            export JWT_SECRET="test-secret"
                            
                            # Ensure mocha has execute permissions
                            chmod +x node_modules/.bin/mocha
                            
                            # Run tests using node directly instead of npx
                            ./node_modules/.bin/mocha \
                                --recursive \
                                --timeout 5000 \
                                --reporter mocha-junit-reporter \
                                --reporter-options mochaFile=./test-results.xml \
                                --exit \
                                "./test/**/**.test.js" || exit 1
                        '''
                    }

                    // Run Referral Service Tests
                    dir('referral-service') {
                        sh '''
                            echo "Installing dependencies for referral-service..."
                            npm install
                            
                            # Install specific version of test reporter and required dependencies
                            npm install --save-dev mocha@9.2.2 mocha-junit-reporter@2.2.0 chai@4.3.7 chai-http@4.3.0
                            
                            echo "Running referral-service tests..."
                            export NODE_ENV=test
                            export MOCHA_FILE="test-results.xml"
                            export MONGO_URI="mongodb://localhost:27018/referral-service-test"
                            export JWT_SECRET="test-secret"
                            
                            # Ensure mocha has execute permissions
                            chmod +x node_modules/.bin/mocha
                            
                            # Run tests using node directly instead of npx
                            ./node_modules/.bin/mocha \
                                --recursive \
                                --timeout 5000 \
                                --reporter mocha-junit-reporter \
                                --reporter-options mochaFile=./test-results.xml \
                                --exit \
                                "./test/**/**.test.js" || exit 1
                        '''
                    }

                    // Run Lab Service Tests
                    dir('lab-service') {
                        sh '''
                            echo "Installing dependencies for lab-service..."
                            npm install
                            
                            # Install specific version of test reporter and required dependencies
                            npm install --save-dev mocha@9.2.2 mocha-junit-reporter@2.2.0 chai@4.3.7 chai-http@4.3.0
                            
                            echo "Running lab-service tests..."
                            export NODE_ENV=test
                            export MOCHA_FILE="test-results.xml"
                            export MONGO_URI="mongodb://localhost:27018/lab-service-test"
                            export JWT_SECRET="test-secret"
                            
                            # Create test file directories
                            mkdir -p test/lab-tests
                            touch test/lab-tests/test-file.jpg
                            touch test/lab-tests/test-file.txt
                            
                            # Ensure mocha has execute permissions
                            chmod +x node_modules/.bin/mocha
                            
                            # Run tests using node directly instead of npx
                            ./node_modules/.bin/mocha \
                                --recursive \
                                --timeout 5000 \
                                --reporter mocha-junit-reporter \
                                --reporter-options mochaFile=./test-results.xml \
                                --exit \
                                "./test/**/**.test.js" || exit 1
                                
                            # Clean up test files
                            rm -f test/lab-tests/test-file.jpg test/lab-tests/test-file.txt
                        '''
                    }
                }
            }
            post {
                always {
                    // Archive all test results
                    junit allowEmptyResults: true, testResults: '**/test-results.xml'
                    
                    sh '''
                        echo "Cleaning up test containers..."
                        docker rm -f mongodb-test || true
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build each service's Docker image and tag with Jenkins build number
                sh 'docker build -t $DOCKERHUB_ACCOUNT/user-service:$BUILD_NUMBER ./user-service'
                sh 'docker build -t $DOCKERHUB_ACCOUNT/patient-service:$BUILD_NUMBER ./patient-service'
                sh 'docker build -t $DOCKERHUB_ACCOUNT/referral-service:$BUILD_NUMBER ./referral-service'
                sh 'docker build -t $DOCKERHUB_ACCOUNT/lab-service:$BUILD_NUMBER ./lab-service'
            }
            post {
                always {
                    jiraSendBuildInfo site: env.JIRA_SITE
                }
            }
        }

        stage('Docker Test') {
            steps {
                sh 'docker --version'
            }
        }

        stage('Docker Hub Login and Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-id', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                        docker info
                        
                        # Push images with error handling
                        services=("user-service" "patient-service" "referral-service" "lab-service")
                        for service in "${services[@]}"; do
                            echo "Pushing $DOCKERHUB_ACCOUNT/$service:$BUILD_NUMBER to Docker Hub..."
                            if docker push $DOCKERHUB_ACCOUNT/$service:$BUILD_NUMBER; then
                                echo "Successfully pushed $service image"
                            else
                                echo "Failed to push $service image. Check Docker Hub permissions and connection."
                                exit 1
                            fi
                        done
                    '''
                }
            }
            post {
                always {
                    jiraSendBuildInfo site: env.JIRA_SITE
                }
            }
        }

        stage('Deploy - Staging') {
            when {
                branch 'main'  // Changed from 'master' to 'main' to match your repository
            }
            steps {
                // Clean up existing containers and deploy new ones
                sh '''
                    # Stop and remove existing containers
                    docker-compose down --remove-orphans
                    
                    # Remove the mongodb container specifically if it exists
                    docker rm -f mongodb || true
                    
                    # Deploy all containers using docker-compose
                    docker-compose up -d
                '''
            }
            post {
                always {
                    jiraSendDeploymentInfo site: env.JIRA_SITE,
                        environmentId: 'patient-info-staging',
                        environmentName: 'Patient Information System - Staging',
                        environmentType: 'staging'
                }
            }
        }

        stage('Deploy - Production') {
            when {
                branch 'main'
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                input message: 'Deploy to production?'
                echo 'Deploying to Production...'
                // Add your production deployment steps here
            }
            post {
                always {
                    jiraSendDeploymentInfo site: env.JIRA_SITE,
                        environmentId: 'patient-info-prod',
                        environmentName: 'Patient Information System - Production',
                        environmentType: 'production'
                }
            }
        }
    }

    post {
        failure {
            echo "Build failed! Please check the logs."
        }
        success {
            echo "Build and deployment successful."
        }
        always {
            jiraSendBuildInfo site: env.JIRA_SITE
        }
    }
}
