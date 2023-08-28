FROM python:3.10-alpine

COPY . /rover

WORKDIR  /rover

RUN pip install "fastapi[all]"

EXPOSE 80

CMD python main.py
