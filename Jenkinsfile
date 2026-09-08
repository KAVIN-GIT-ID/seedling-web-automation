pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20-LTS'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'COMPONENT',
            choices: [
                'all',
                'tests/auth/signup-validation.spec.ts',
                'tests/auth/login.spec.ts',
                'tests/auth/forgot-password-otp.spec.ts',
                'tests/auth/dashboard/dashboard.spec.ts',
                'tests/auth/dashboard/donation.spec.ts',
                'tests/auth/dashboard/donation-comment.spec.ts',
                'tests/auth/seedling/create-seedling.spec.ts',
                'tests/auth/seedling/share-all-channels.spec.ts',
                'tests/unauth/seedling/search-charity.spec.ts',
                'tests/unauth/seedling/share-all-channels.spec.ts',
                'tests/api/oauth-api.spec.ts'
            ],
            description: 'Test file to run on QA'
        )
    }

    environment {
        CI = 'true'
        ENV = 'qa'
        BASE_URL = 'https://qa.seedlingsocial.org'
        SURGE_LOGIN = 'kavinap@uit.ac.in'
        SURGE_TOKEN = '8d9007929b91f647f65f8f3667da6ae0'
        EMAIL_HOST = 'smtp.gmail.com'
        EMAIL_PORT = '465'
        EMAIL_USERNAME = 'kavinap@uit.ac.in'
        EMAIL_PASSWORD = 'yewoyvymmbjqxtus'
        TEST_USER_EMAIL = 'kavinap@uit.ac.in'
        IMAP_PASS = 'yewoyvymmbjqxtus'
        TL_EMAIL = 'kavinap@uit.ac.in'
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
                sh 'npx playwright install --with-deps chromium || npx playwright install chromium'
            }
        }

        stage('Execute Playwright Tests') {
            steps {
                script {
                    def orderedSpecs = "tests/auth/signup-validation.spec.ts tests/auth/forgot-password-otp.spec.ts tests/auth/dashboard/dashboard.spec.ts tests/auth/seedling/share-all-channels.spec.ts tests/unauth/seedling/search-charity.spec.ts tests/unauth/seedling/share-all-channels.spec.ts tests/auth/dashboard/donation.spec.ts tests/auth/dashboard/donation-comment.spec.ts tests/auth/seedling/create-seedling.spec.ts"

                    def testCmd = (params.COMPONENT == 'all') ? "npm run test:qa -- ${orderedSpecs} --workers=1" : "npm run test:qa -- ${params.COMPONENT}"

                    // Log output to test-output.log for email summary parsing (just like GitHub Actions)
                    sh "${testCmd} 2>&1 | tee test-output.log"
                }
            }
        }
    }

    post {
        always {
            script {
                // 1. Deploy HTML report to Surge (same domain pattern as GitHub Actions)
                def surgeDomain = "jenkins-${BUILD_NUMBER}-seedling-qa.surge.sh"
                sh "npx --yes surge ./playwright-report ${surgeDomain} || true"

                // 2. Prepare and send formatted email report
                withEnv([
                    "JOB_STATUS=${(currentBuild.currentResult ?: 'SUCCESS').toLowerCase()}",
                    "TEST_ENV=QA",
                    "TEST_COMPONENT=${params.COMPONENT ?: 'all'}",
                    "TEST_BRANCH=main",
                    "REPORT_URL=https://${surgeDomain}",
                    "RUN_URL=${env.BUILD_URL}"
                ]) {
                    sh "node utils/generate-email-html.js || true"
                    sh "node utils/send-email.js || true"
                }
            }

            // 3. Publish report and artifacts in Jenkins UI
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
            archiveArtifacts artifacts: 'test-results/**, videos/**', allowEmptyArchive: true
        }
        failure {
            echo "Pipeline failed! Please check the Playwright HTML Report or your email."
        }
    }
}
