build:
	docker build -t dsc/shecduler-back:latest .

run:
	docker run -it -p 3000:3000 dsc/shecduler-back:latest