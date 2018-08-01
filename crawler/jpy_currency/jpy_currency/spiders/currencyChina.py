# -*- coding: utf-8 -*-                                                                
import scrapy
import re
from datetime import datetime
from jpy_currency.items import CurrencyItem

class CurrencyChinaSpider(scrapy.Spider):
    name = "currencyChina"

    def start_requests(self):
        print('start request china trust')
        urls = [
            'https://www.ctbcbank.com/CTCBPortalWeb/toPage?id=TW_RB_CM_ebank_018001'
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        print('china trust:%s' % response)
        item = CurrencyItem(
            name = 'ChinaTrust bank',
            updated_time = datetime.now()
        )
        currency_table = response.xpath(
            '//*[@id="mainTable"]'
        )
        jpy = []
        for row in currency_table.xpath('tr'):
            currencies = [col.xpath('normalize-space(text())').extract_first('0') for
                          col in row.xpath('td') ]
            print currencies[0]
            if re.match('\W*JPY\W*', currencies[0]):
                jpy = currencies[2]
                item['currency'] = jpy
                item['coin_type'] = 'jpy'
                item['flow_type'] = 'cash_selling'
                yield item
            if re.match('\W*USD\W*', currencies[0]):
                usd = currencies[2]
                item['currency'] = usd 
                item['coin_type'] = 'usd'
                item['flow_type'] = 'cash_selling'
                yield item
            if re.match('\W*THB\W*', currencies[0]):
                thb = currencies[2]
                item['currency'] = thb
                item['coin_type'] = 'thb'
                item['flow_type'] = 'cash_selling'
                yield item
            if re.match('\W*EUR\W*', currencies[0]):
                eur = currencies[2]
                item['currency'] = eur
                item['coin_type'] = 'eur'
                item['flow_type'] = 'cash_selling'
                yield item
