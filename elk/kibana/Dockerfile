FROM docker.elastic.co/kibana/kibana:5.1.2
RUN bin/kibana-plugin remove x-pack
COPY ./kibana.yml /usr/share/kibana/config/kibana.yml
