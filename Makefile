build:
	cd src && \
	rollup index.js -o ../functions/api.js -f cjs -e https && \
	cp ../functions/api.js ../__sk__app.js
