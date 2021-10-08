build:
	cd src && \
	rollup index.js -o ../functions/api.js -f cjs -e https
