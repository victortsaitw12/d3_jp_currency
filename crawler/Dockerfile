FROM python:2.7
RUN mkdir -p /app
WORKDIR /app
ADD . /app
RUN pip install scrapy
RUN pip install pymongo
RUN pip install elasticsearch_dsl
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
CMD /bin/bash -c "cd jpy_currency && python routine.py"
