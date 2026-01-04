.PHONY: build-contract build-frontend deploy help

help:
	@echo "SpaceMoney Automation Commands:"
	@echo "  make build-contract  - Build the Anchor smart contract"
	@echo "  make build-frontend  - Build the React frontend"
	@echo "  make deploy          - Build everything and deploy to Vercel"

build-contract:
	cd spacemoney-contract && anchor build

build-frontend:
	cd spacemoney-frontend && npm install && npm run build

deploy: build-frontend
	vercel --prod
