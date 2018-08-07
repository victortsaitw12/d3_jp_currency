FROM elasticsearch:5.1.1
RUN apt-get update
RUN apt-get install zip
RUN mkdir -p /usr/share/elasticsearch/plugins/ik
RUN cd /usr/share/elasticsearch/plugins/ik && wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v5.1.1/elasticsearch-analysis-ik-5.1.1.zip && unzip elasticsearch-analysis-ik-5.1.1.zip
