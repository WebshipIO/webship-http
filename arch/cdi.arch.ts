/***************************************************************************

            <<Context & Denpendency Injection>> Design Model

****************************************************************************

结构图

                      Dependency
              (Dependency Injection Configuration)
                      /         \
                     /           \
                 Node             Provider   
    
    1 Dependency 仅仅表示一个依赖的配置
    2 只有使用 createNode() 函数创建的实例，其依赖才会正确注入
    3 Provider 仅仅提供依赖的实例创建工厂


运行图

                           app                    ApplicationScope
                            |
               +--------+--------+--------+
               |        |        |        |
              node     node     node     node     SessionScope
               |
         +-----+-----+   
         |     |     |
       route route route                          RequestScope　　 
       　

数据表 

    1 Provider Container - 存储 Provider，Provider 提供创建依赖的具体算法

      ApplicationScope(name => Provider)
      SessionScope    (name => Provider)
      RequestScope    (name => Provider)

    2 Provider Instance Context - 存储应用程序运行过程中创建的 Provider 实例

      (
        local: (name => Provider Instance)
        sessions: (session => local: (name => Provider Instance)
                           => requests: (request => local: (name => Provider Instance))))

    3 Node Instance Context - 存储应用程序运行过程中创建的 Node 实例

      (
        local: (Node => [Instance, ...])
        sessions: (session => local: [Node Instance, ...]
                           => requests: (request => local: [Node Instance, ...])))

    4 Node Instance Config Map - 存储应用程序运行过程中创建的 Node 实例所包含的环境信息

      (Node Instance => scope, sessionIdent?, requestIdent?)

    5 Node Dependency Container - 存储节点的依赖细节

      ((Node => ('constructor()' => [('mysqlPool1', MysqlPool, ApplicationScope, Parameter, 0),...])
             => ('show()' => [('user', User, RequestScope, Parameter, 0),...])
             => ...
       ), ...)

       依赖位置有两种情况、一种位置（函数参数）：

       - 成员函数的参数 => new UserControler(this.app.getApplicationScopeProvider<MysqlPool>('mysqlPool1'))
       - 构造函数的参数 => show = () => {show(this.app.getRequestScopeProvider<User>('user', this.session, this.request))}

    6 Node Queue - 存储标记为处理的节点

      [Node, ...]


处理过程

    1 注册节点依赖细节

      registerNodeDependency(node, name, dependency)

      @ApplicationScope(name: PropertyKey) => T
      @SessionScope    (name: PropertyKey) => T
      @RequestScope    (name: PropertyKey) => T

    2 转换节点依赖细节

      transform()

    3 实例化框架应用程序

      app = Framework.create()

    4 注册 Providers

      app.registerApplicationScopeProvider<T>(name: PropertyKey, provider: () => T)
      app.registerSessionScopeProvider<T>    (name: PropertyKey, provider: () => T)
      app.registerRequestScopeProvider<T>    (name: PropertyKey, provider: () => T)

    5 扫描，检查类型安全

      app.scanAndCheckTypeSafe() => 扫描　Provider Map　和　Node Dependency Map，检查已经注册的 Provider 是否匹配依赖

      1. Node Dependency Map 注册的依赖可以在 Provider Map 找到
      2. Node Dependency Map 注册的依赖的作用域匹配 Provider Map 注册的作用域
      3. Node Dependency Map 注册的依赖的类型匹配 Provider Map 注册的类型

    6 创建 Application Session Request 及其依赖

      app.createDependency()

    7 创建节点实例，注册节点实例

      app.createNode(node, scope)

      - ApplicationScope => app.getApplicationScopeElement(name)
      - SessionScope     => app.getSessionScopeElement(name, session)
      - RequestScope     => app.getRequestScopeElement(name, session, request)

    8 回收节点实例

      app.disposeNode(node) 


例子

    let appConfig = new ApplicationConfig()
    
    app.registerApplicationScopeProvider<ApplicationConfig>('appConfig', (): ApplicationConfig => appConfig)
    app.registerApplicationScopeProvider<MysqlPool>('mysqlPool1', (): MysqlPool => new MysqlPool(appConfig))
    app.registerApplicationScopeProvider<MysqlPool>('mysqlPool2', (): MysqlPool => new MysqlPool(appConfig))
    app.registerSessionScopeProvider<User>('user', (): User => new User())
    app.registerRequestScopeProvider<User>('user', (): User => new User())
    
    @Controller 
    class UserController {
      constructor(
        @ApplicationScope('mysqlPool1') mysql: MysqlPool,
        @SessionScope('user') @SessionScope('abc ') user: User
      ) {
      }

      @Get('/users')
      show(@RequestScope('user') user: User) {
      }
    }

***************************************************************************/

