# -*- coding: utf-8 -*-                                                                
import scrapy
import re
from datetime import datetime
from jpy_currency.items import ArticleItem

class ArticleSpider(scrapy.Spider):
    name = "articleSpider"

    def start_requests(self):
        print('start request currency news')
        urls = ['https://www.bankchb.com/frontend/G0100.jsp']
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        item = ArticleItem(
            title = 'test title',
            content='test content'
        )
        yield item
