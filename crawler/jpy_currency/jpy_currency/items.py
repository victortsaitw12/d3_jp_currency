# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# https://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class CurrencyItem(scrapy.Item):
    # define the fields for your item here like:
    name = scrapy.Field()
    jpy = scrapy.Field()
    updated_time = scrapy.Field()
    currency = scrapy.Field()
    coin_type = scrapy.Field()
    flow_type = scrapy.Field()
    all_data = scrapy.Field()
    pass

class ArticleItem(scrapy.Item):
    title = scrapy.Field()
    content = scrapy.Field()
    pass
