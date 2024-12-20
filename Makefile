.PHONY: build-prod clean

build-prod:
	@echo "Switching to production configuration..."
	cp public/config.prod.json public/config.json
	@echo "Building production artifacts..."
	npm run build
	@echo "Renaming dist to parbot_extension..."
	mv dist parbot_extension
	@echo "Packaging parbot_extension to parbot_extension.zip..."
	zip -r parbot_extension.zip parbot_extension
	@echo "Switching back to development configuration..."
	cp public/config.dev.json public/config.json
	@echo "Building development artifacts..."
	npm run build
	@echo "Build process completed."

clean:
	@echo "Cleaning up..."
	rm -f parbot_extension.zip
	rm -rf dist parbot_extension
	@echo "Cleanup completed."
