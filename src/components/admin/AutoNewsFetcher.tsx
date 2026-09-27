import React from 'react';
import { UrlNewsFetcher } from './UrlNewsFetcher';
import { Article, Category, Subcategory, Author } from '../../types';

interface AutoNewsFetcherProps {
  categories: Category[];
  subcategories: Subcategory[];
  authors: Author[];
  onPublishArticle: (articleData: Omit<Article, 'id'>) => Promise<Article>;
  onOpenArticleEditor: (articleData: Partial<Article>) => void;
  onViewLiveArticle: (slug: string) => void;
}

export const AutoNewsFetcher: React.FC<AutoNewsFetcherProps> = (props) => {
  return <UrlNewsFetcher {...props} />;
};

export { UrlNewsFetcher };
export default UrlNewsFetcher;
