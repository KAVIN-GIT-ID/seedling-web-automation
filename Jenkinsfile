pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'COMPONENT',
            choices: [
                'all',
                'tests/auth/signup-validation.spec.ts',
                'tests/auth/forgot-password-otp.spec.ts',
                'tests/auth/dashboard/dashboard.spec.ts',
                'tests/auth/seedling/create-seedling.spec.ts',
                'tests/auth/seedling/share-all-channels.spec.ts',
                'tests/unauth/seedling/search-charity.spec.ts',
                'tests/unauth/seedling/share-all-channels.spec.ts',
                'tests/auth/dashboard/donation.spec.ts',
                'tests/auth/dashboard/donation-comment.spec.ts',
                'tests/api/oauth-api.spec.ts'
            ],
            description: 'Select test spec to run on QA'
        )
    }

    environment {
        CI = 'true'
        ENV = 'qa'
        BASE_URL = 'https://qa.seedlingsocial.org'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Verify Node & Install Packages') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npm ci'
            }
        }

        stage('Install Playwright Browser') {
            steps {
                // If running in Docker as root or with permissions, install chromium and deps
                sh 'npx playwright install --with-deps chromium || npx playwright install chromium'
            }
        }

        stage('Execute Playwright Tests') {
            steps {
                script {
                    def orderedSpecs = "tests/auth/signup-validation.spec.ts tests/auth/forgot-password-otp.spec.ts tests/auth/dashboard/dashboard.spec.ts tests/auth/seedling/share-all-channels.spec.ts tests/unauth/seedling/search-charity.spec.ts tests/unauth/seedling/share-all-channels.spec.ts tests/auth/dashboard/donation.spec.ts tests/auth/dashboard/donation-comment.spec.ts tests/auth/seedling/create-seedling.spec.ts"

                    if (params.COMPONENT == 'all') {
                        sh "npm run test:qa -- ${orderedSpecs} --workers=1"
                    } else {
                        sh "npm run test:qa -- ${params.COMPONENT}"
                    }
                }
            }
        }
    }

    post {
        always {
            // Publish Playwright HTML Report in Jenkins UI
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
            // Archive screenshots, traces, and test results
            archiveArtifacts artifacts: 'test-results/**, videos/**', allowEmptyArchive: true
        }
        failure {
            echo "Tests failed! Check the Playwright HTML Report in the left sidebar."
        }
    }
}
