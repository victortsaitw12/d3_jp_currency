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
                item['currency'] = jpy
                item['coin_type'] = 'jpy'
                item['flow_type'] = 'cash_selling'
                yield item
            if re.match("\W*ＴＨＢ\W*", currencies[0].encode('UTF-8')):
                thb = currencies[2]
                item['currency'] = thb
                item['coin_type'] = 'thb'
                item['flow_type'] = 'cash_selling'
                yield item
            if re.match("\W*ＥＵＲ－Ｃ\W*", currencies[0].encode('UTF-8')):
                eur = currencies[2]
                item['currency'] = eur
                item['coin_type'] = 'eur'
                item['flow_type'] = 'cash_selling'
                yield item
            if re.match("\W*ＵＳＤ－Ｃ\W*", currencies[0].encode('UTF-8')):
                usd = currencies[2]
                item['currency'] = usd
                item['coin_type'] = 'usd'
                item['flow_type'] = 'cash_selling'
                yield item
