include .env

# Variables for deployment
PROJECT_ID ?= dataclouder-dev
IMAGE_NAME ?= node-app-image
REGION ?= us-central1
SERVICE_NAME ?= node-server

.PHONY: deploy gcp-enable-services build-push deploy-service

# Main deploy target that runs all necessary steps
deploy: build-push deploy-service

# Enable required Google Cloud services
gcp-enable-services:
	@echo "Enabling required services for $(PROJECT_ID)..."
	gcloud config set project $(PROJECT_ID)
	gcloud services enable run.googleapis.com
	gcloud services enable cloudbuild.googleapis.com
	gcloud services enable artifactregistry.googleapis.com


# Build the Docker image and push to Google Container Registry Note gcr.io is the default artifact registry for docker now. can be expensive. better creaet a local one.
build-push:
	@echo " -> Building gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) image and pushing to Google Container Registry..."
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) .

# Deploy to Cloud Run, use .env variables except GOOGLE_APPLICATION_CREDENTIALS
deploy-service:
	@echo "Deploying to Cloud Run..."
	@ENV_VARS=$$(node scripts/env_parser.js); \
	echo "Environment Variables to be deployed:"; \
	echo "$${ENV_VARS}" | tr ',' '\n'; \
	gcloud run deploy $(SERVICE_NAME) \
		--project $(PROJECT_ID) \
		--image gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--set-env-vars "$${ENV_VARS}"
	@echo "Deployment complete! You can check the status using:"
	@echo "gcloud run services describe $(SERVICE_NAME) --region $(REGION)"

update-dc:
	npm run update:dc

update-all:
	ncu -u

publish-mongo:
	npm run publish:mongo


start:
	npm run start:dev

merge-upstream:
	git fetch upstream
	git checkout main
	git merge upstream/main
	

publish-google-cloud:
	npm run publish:google-cloud