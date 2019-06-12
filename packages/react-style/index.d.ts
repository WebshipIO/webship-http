import React = require("react")
import Styles = require("@material-ui/styles")
import Css = require("csstype")
import Jss = require("jss")

declare namespace WebNode {
  export interface StyleProperties {
    [key: string]: Css.Properties | Css.PropertiesFallback | { [P in Css.SimplePseudos]?: Css.Properties } | StyleProperties
  }

  export interface ComponentClass<A extends React.Component<P, S> = any, P = any, S = any> {
    new(props: Readonly<P>): A
  }

  export class StyleProvider extends Map<ComponentClass, Jss.StyleSheet<string>> {
    public static readonly instance: StyleProvider
    public static of(C: ComponentClass): Record<string, string>
    public static set(C: ComponentClass, styles: StyleProperties): StyleProvider
  }

  export function Style(styles: StyleProperties): <T extends ComponentClass>(C: T) => T
}

export = WebNode
