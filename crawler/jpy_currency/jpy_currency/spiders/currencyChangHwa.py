# -*- coding: utf-8 -*-
import scrapy
import re
from datetime import datetime
from jpy_currency.items import CurrencyItem

class CurrencyChangHwaSpider(scrapy.Spider):
    name = 'currencyChangHwa'

    def start_requests(self):
        print('start crawl Chang Hwa bank')
        urls = ['https://www.bankchb.com/frontend/G0100.jsp']
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        print('response:%s' % response)
        item = CurrencyItem(
            name = 'Chang Hwa bank',
            updated_time = datetime.now()
        )
        currency_table = response.xpath(
          '//div[@id="content-inside"]//table[@class="table table-data"]/tbody'
        )
        jpy = ''
        for row in currency_table.xpath('tr'):
            currencies= []
            for col in row.xpath('td'):
                c = col.xpath('normalize-space(text())').extract_first("0")
                currencies.append(c)
            if re.match("\W*ＪＰＹ－Ｃ\W*", currencies[0].encode('UTF-8')):
                jpy = currencies[2]
        item['jpy'] = jpy
        yield item

