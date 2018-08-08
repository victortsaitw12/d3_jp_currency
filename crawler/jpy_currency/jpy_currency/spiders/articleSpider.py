# -*- coding: utf-8 -*-                                                                
import scrapy
import re
from datetime import datetime
from jpy_currency.items import ArticleItem
from scrapy.utils.markup import remove_tags

class ArticleSpider(scrapy.Spider):
    name = "articleSpider"

    def start_requests(self):
        print('start request currency news')
        urls = ['https://news.cnyes.com/news/cat/forex?exp=a']
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
      article = response.xpath('//div[@class="_2bF theme-list"]/div/a[@title]')
      for tag in article:
          title = tag.xpath('@title').extract_first()
          link = tag.xpath('@href').extract_first()
	  article_id = tag.xpath('@data-exp-id').extract_first()
          if article_id is None:
	      continue
          time_tag = tag.xpath('.//time')
          time = time_tag.xpath('@datetime').extract_first()

          next_page = response.urljoin(link)
          request = scrapy.Request(next_page,
              callback=self.parse_article)
          request.meta['title'] = title
          request.meta['url'] = next_page
	  request.meta['article_id'] = article_id
          request.meta['time'] = time
          yield request

    def parse_article(self, response):
        title = response.meta['title']
        url = response.meta['url']
        article_id = response.meta['article_id']
        time = response.meta['time']
        print article_id, time, title, url
        article = response.xpath('//div[@itemprop="articleBody"]')
        print remove_tags(article.extract_first())

        item = ArticleItem(
            title = title,
	    article_id = article_id,
            time = time,
            content=remove_tags(article.extract_first())
        )
        yield item
