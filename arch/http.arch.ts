/***************************************************************************

                      <<HTTP Server>> Design Model

****************************************************************************

结构图

             Http.Server
                  |
      'connection' 'request' --- 'close', ...
                  |
               Executor
           /              \
    SessionExecutor   RequestExecutor
          |                |
     Controller      ControllerMethod
          |                |
           \              /
            |            |
            +------------+
                  |
         Controller Dispatcher

数据表 

    1 Controller Set - 存储 Controller Node

      [Node]

    2 Connection Set - 存储连接生命周期 Node

      [Node]

    3 Method Container - 存储操作方法

      (method => Handler(Node, 'create()', [Parameter], [Middleware], Payload))

    4 Route Container - 存储请求路由

      (HttpMethod => RePathname => Route([method], 'GET', {'/users/:id'}))

    5 Connection Lifecycle Set - 存储连接生命周期路由

      [method]
*/