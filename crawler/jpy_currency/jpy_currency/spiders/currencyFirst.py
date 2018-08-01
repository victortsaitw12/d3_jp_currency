# -*- coding: utf-8 -*-
import scrapy
import re
from datetime import datetime
from jpy_currency.items import CurrencyItem

class CurrencyFirstSpider(scrapy.Spider):
    name = 'currencyFirst'
    allowed_domains = [
      'ibank.firstbank.com.tw'
    ]
    start_urls = [
      'https://ibank.firstbank.com.tw/NetBank/7/0201.html?sh=none/'
    ]

    def parse(self, response):
        print('response:%s' % response)
        item = CurrencyItem(
            name = 'First bank',
            updated_time = datetime.now()
        )
        table = response.xpath('//*[@id="table1"]//tr')
        jpy = ''
        for row in table:
            list = []
            for col in row.xpath('td'):
                if not col.xpath('img').extract_first() is None:
                    country = col.xpath('img/@alt').extract_first()
                    list.append(country)
                    continue
                currency = col.xpath('normalize-space(text())').extract_first("")
                list.append(currency)
            if len(list) <= 0: 
                continue
            if re.match('現鈔'.decode('utf-8'), list[1]):
                print list[0]
                if re.match('\W*JPY\W*', list[0]):
                    jpy = list[3]
                    item['currency'] = jpy
                    item['coin_type'] = 'jpy'
                    item['flow_type'] = 'cash_selling'
                    yield item
                if re.match('\W*USD\W*', list[0]):
                    usd = list[3]
                    item['currency'] = usd
                    item['coin_type'] = 'usd'
                    item['flow_type'] = 'cash_selling'
                    yield item
                if re.match('\W*THB\W*', list[0]):
                    thb = list[3]
                    item['currency'] = thb
                    item['coin_type'] = 'thb'
                    item['flow_type'] = 'cash_selling'
                    yield item
                if re.match('\W*EUR\W*', list[0]):
                    eur = list[3]
                    item['currency'] = eur
                    item['coin_type'] = 'eur'
                    item['flow_type'] = 'cash_selling'
                    yield item
              
        
