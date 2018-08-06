# -*- coding: utf-8 -*-

import smtplib
import pymongo
from scrapy.conf import settings
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText
from datetime import datetime, timedelta
from elasticsearch_dsl import DocType, analyzer, Date, Keyword, Integer, Text
from elasticsearch_dsl.connections import connections


elk_uri = settings['ELK_URI']
connections.create_connection(hosts=[elk_uri])
class Article(DocType):
  #title = Text(analyzer="ik_max_word")
  title = Text(analyzer='snowball', fields={'raw': Keyword()})
  content = Text(analyzer='snowball', fields={'raw': Keyword()})
  #content = Text(analyzer="ik_max_word")
  class Index:
      name = 'article'

Article.init()

class Utility(object):

    db = None
    client = None
    elk = None
    @staticmethod
    def init():
        print 'init Mongo & elk Connection'
        Utility.client = pymongo.MongoClient(settings['MONGO_URI'])
        Utility.db = Utility.client[settings['MONGO_DATABASE']]

    @staticmethod
    def saveToELK(item):
        article = Article()
        article.title = item["title"]
        article.content = item['content']
        print 'save to elk'
        article.save()

    @staticmethod
    def getDB():
        return Utility.db;

    @staticmethod
    def destruct():
        Utility.client.close()
       
    @staticmethod
    def sendMailToUser():
        querys = [
            {'$match': {
                'updated_time': {
                    '$gt': datetime.now() - timedelta(minutes=1)
                }
            }},
            {'$sort': { 'jpy': 1 }},
            { '$limit': 1 }
        ]
        cursor = Utility.db[settings['MONGO_COLLECTION']].aggregate(querys) 
        for doc in cursor:
            message = '%s:%s: JPY Currency %s' % (
                doc['name'], 
                doc['updated_time'].strftime("%Y-%m-%d %H:%M:%S"),
                doc['currency']
            )
            Utility.send_mail(message, message)

    @staticmethod
    def send_mail(message, title):
        print message
        return
        gmailUser = settings['GMAIL_USER']
        gmailPassword = settings['GMAIL_PASSWORD']

        msg = MIMEMultipart()
        msg['From'] = gmailUser
        msg['To'] = gmailUser
        msg['Subject'] = title
        msg.attach(MIMEText(message))

        mailServer = smtplib.SMTP('smtp.gmail.com', 587)
        mailServer.ehlo()
        mailServer.starttls()
        mailServer.ehlo()
        mailServer.login(gmailUser, gmailPassword)
        mailServer.sendmail(gmailUser, gmailUser, msg.as_string())
        mailServer.close()
        print "Mail sent"
