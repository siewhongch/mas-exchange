declare module 'disqus-react' {
  import * as React from 'react';

  export interface DiscussionEmbedConfig {
    url?: string;
    identifier?: string;
    title?: string;
    language?: string;
    category_id?: string;
    remoteAuthS3?: string;
    apiKey?: string;
    sso?: {
      name?: string;
      button?: string;
      icon?: string;
      url?: string;
      logout?: string;
      profile_url?: string;
      width?: string;
      height?: string;
    };
  }

  export interface DiscussionEmbedProps {
    shortname: string;
    config: DiscussionEmbedConfig;
  }

  export class DiscussionEmbed extends React.Component<DiscussionEmbedProps, any> {}

  export interface CommentCountProps {
    shortname: string;
    config: {
      url?: string;
      identifier?: string;
      title?: string;
    };
    children?: React.ReactNode;
    className?: string;
  }

  export class CommentCount extends React.Component<CommentCountProps, any> {}
}
