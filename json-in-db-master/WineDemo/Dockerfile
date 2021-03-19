FROM oraclelinux:7-slim
#FROM oraclelinux:7.6

#RUN yum install -y oracle-instantclient19.3-basic.x86_64
#RUN yum install -y oracle-release-el7 && \
#    yum install -y oracle-instantclient19.6-basiclite.x86_64 && \
#    yum install -y oracle-nodejs-release-el7 && \
#    yum install -y --disablerepo=ol7_developer_EPEL nodejs && \
#    yum install -y bzip2 && \
#    yum install -y unzip 
    
RUN yum install -y oracle-release-el7 oracle-nodejs-release-el7 && \
    yum-config-manager --disable ol7_developer_EPEL && \
    yum install -y oracle-instantclient19.6-basiclite.x86_64 nodejs tar bzip2 unzip && \
    rm -rf /var/cache/yum

COPY . /app    
RUN rm -rf /app/package-lock.json    

RUN unzip /app/dbwallet.zip -d /wallet && rm /app/dbwallet.zip && \
#RUN ls -la /wallet && cat /wallet/sqlnet.ora && sed -i 's/?\/network\/admin/\/wallet/g' /wallet/sqlnet.ora && cat /wallet/sqlnet.ora
    sed -i 's/?\/network\/admin/\/wallet/g' /wallet/sqlnet.ora

RUN npm -g install @oracle/ojet-cli
#RUN npm -g install pm2

WORKDIR /app
RUN npm install && ojet build

#CMD ["pm2-runtime", "/app/process.json"]
CMD ["node", "/app/server.js"]
