import * as Css from 'csstype'
import {Component} from 'react'
import {jssPreset} from '@material-ui/styles'
import {StyleSheet} from 'jss'
import Jss from 'jss'

export interface StyleProperties {
  [key: string]: Css.Properties | Css.PropertiesFallback | { [P in Css.SimplePseudos]?: Css.Properties } | StyleProperties
}

export interface ComponentClass<A extends Component<P, S> = any, P = any, S = any> {
  new(props: Readonly<P>): A
}

export class StyleProvider extends Map<ComponentClass, StyleSheet<string>> {
  private static sInstance: StyleProvider

  public static get instance(): StyleProvider {
    if (StyleProvider.sInstance === undefined) {
      Jss.setup(jssPreset())
      StyleProvider.sInstance = new Map()
    }
    return StyleProvider.sInstance
  }

  public static of(C: ComponentClass): Record<string, string> {
    return StyleProvider.instance.get(C).classes
  }

  public static set(C: ComponentClass, styles: StyleProperties): StyleProvider {
    return StyleProvider.instance.set(C, Jss.createStyleSheet(styles).attach())
  }
}

export function Style(styles: StyleProperties): <T extends ComponentClass>(C: T) => T {
  return function <T extends ComponentClass>(C: T): T {
    StyleProvider.set(C, styles)
    return C
  }
}