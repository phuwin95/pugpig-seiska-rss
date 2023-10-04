export interface FullArticle {
  article: Article;
}

export interface Article {
  "@attributes": ArticleAttributes;
  attribute:     Attribute;
  mainterm:      Mainterm;
  term:          Mainterm;
  field:         ArticleFieldClass;
  primarytag:    Primarytag;
  tag:           Tag;
  children:      ArticleChildren;
}

export interface ArticleAttributes {
  id:    string;
  type:  string;
  dirty: string;
}

export interface Attribute {
  "@attributes":  AttributeAttributes;
  id:             string;
  status:         string;
  user_id:        string;
  parent_id?:     string;
  instanceof_id?: string;
}

export interface AttributeAttributes {
  type?:       string;
  collection?: string;
}

export interface ArticleChildren {
  "@attributes": AttributeAttributes;
  articleHeader: ArticleHeader;
  articleList:   ArticleList;
  image:         ImageElement[];
  jwplayer?:      Jwplayer;
  byline:        BylineClass;
  markup?:        MarkUp[] | MarkUp;
}

export interface MarkUp {
  "@attributes": AttributeAttributes;
  attribute:     Attribute;
  field: {
    markup?: string;
    vid?: string;
  }
}

export interface ArticleHeader {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  mainterm:      Mainterm;
  term:          Mainterm;
  field:         ArticleHeaderField;
  children:      ArticleHeaderChildren;
}

export interface ArticleHeaderAttributes {
  id:   string;
  type: string;
}

export interface ArticleHeaderChildren {
  "@attributes": AttributeAttributes;
  image:         PurpleImage;
  jwplayer?:      Jwplayer;
}

export interface PurpleImage {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  field:         FluffyField;
}

export interface ArticleHeaderField {
  "@attributes":         AttributeAttributes;
  instanceofprototypeid: string;
  viewports_json:        string;
  title?:                string;
}

export interface ArticleList {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  field:         ArticleHeaderField;
  children:      ArticleListChildren;
}

export interface ArticleListChildren {
  "@attributes": AttributeAttributes;
  article:       ArticleElement[];
}

export interface ArticleElement {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  field:         ArticleField;
  tag:           Tag;
  children:      ArticleChildrenClass;
}

export interface ArticleChildrenClass {
  "@attributes": AttributeAttributes;
  image:         FluffyImage;
}

export interface FluffyImage {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  field:         FluffyField;
}

export interface FluffyField {
  "@attributes":  AttributeAttributes;
  heighty?:        string;
  heightx?:        string;
  y?:              string;
  heightw?:        string;
  heighth?:        string;
  cropw?:          string;
  croph?:          string;
  x?:              string;
  viewports_json?: string;
}

export interface Mainterm {}

export interface ArticleField {
  "@attributes":  AttributeAttributes;
  published:      string;
  cross_brand:    string;
  byline:         Mainterm | string;
  viewports_json: string;
  title:          string;
  subtitle:       Mainterm | string;
  site_id:        string;
  site_alias:     string;
  showcomments:   Mainterm;
  section:        string;
  published_url:  string;
  kicker:         Mainterm | string;
  katsoCategory?: string;
  hideAds?:       Mainterm;
  bylineImage?:   Mainterm;
}

export interface Tag {
  "@attributes": TagAttributes;
  tag:           string[] | string;
}

export interface TagAttributes {
  type:        string;
  collection:  string;
  multivalued: string;
}

export interface BylineClass {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  mainterm:      Mainterm;
  term:          Mainterm;
  field:         BylineField;
}

export interface BylineField {
  "@attributes":  AttributeAttributes;
  public_url:     Mainterm;
  public_phone:   Mainterm;
  public_email:   Mainterm;
  lastname:       string;
  firstname:      string;
  email:          Mainterm;
  description2:   Mainterm;
  description:    Mainterm;
  viewports_json: string;
}

export interface ImageElement {
  "@attributes": ArticleHeaderAttributes;
  attribute:     Attribute;
  mainterm:      Mainterm;
  term:          Mainterm;
  field:         TentacledField;
}

export interface TentacledField {
  "@attributes":  AttributeAttributes;
  y?:              string;
  x?:              string;
  viewports_json?: string;
  metadata_key?:   string;
  cropw?:          string;
  croph?:          string;
  name?:           string;
  imageCaption?:   string;
  caption?:        string;
  byline?:         string;
}

export interface ViewportJson {
  desktop?: {
    fields: {
      cropw?: number;
      croph?: number;
      x?: number;
      y?: number;
      bbRatio?: number;
      vpWidth?: number;
      whRatio?: number;
    }
  }
}

export interface Jwplayer {
  "@attributes"?: ArticleHeaderAttributes;
  attribute?:     Attribute;
  mainterm?:      Mainterm;
  term?:          Mainterm;
  field?:         JwplayerField;
}

export interface JwplayerField {
  "@attributes":  AttributeAttributes;
  title:          string;
  preview:        string;
  description:    string;
  viewports_json: string;
  vid:            string;
}

export interface ArticleFieldClass {
  "@attributes":       AttributeAttributes;
  created_by_name:     string;
  created_by:          string;
  created:             string;
  bodytext:            string;
  lab_site_id:         string;
  cross_brand:         string;
  used_image_ids_json: string;
  title:               string;
  subtitle:            string;
  structure_json:      string;
  showonfp:            string;
  publishhidden:       string;
  page_template_alias: string;
  lockUser:            string;
  lockTime:            string;
  lockSessionId:       string;
  last_published_by:   string;
  has_published:       string;
  visibility_status:   string;
  published:           string;
  published_urls_json: string;
  published_url:       string;
}

export interface Primarytag {
  "@attributes": AttributeAttributes;
  section:       string;
}

export interface Structure {
  type:     string;
  width:    number;
  metadata: StructureMetadata;
  id:       string;
  selector: string;
  children: StructureChild[];
  node_id:  number;
}

export interface StructureChild {
  type:     string;
  width:    number;
  metadata: PurpleMetadata;
  id:       string;
  children: ChildChild[];
  node_id:  number;
}

export interface ChildChild {
  type:     string;
  width:    number;
  metadata: StructureMetadata;
  id:       string;
  children: ChildChild[];
  node_id:  number;
}

export interface StructureMetadata {
  width: Width;
}

export interface Width {
}

export interface PurpleMetadata {
  width:          BodyTextIndex;
  float?:         Float;
  bodyTextIndex?: BodyTextIndex;
}

export interface BodyTextIndex {
  desktop?: number;
}

export interface Float {
  desktop: string;
}
