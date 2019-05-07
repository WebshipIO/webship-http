WebNode
=========

A web framework that focuses on efficiency and agility. Implemented context and dependency injection inspired by Java EE CDI and .Net core dependency injection.


TODO List
----------

- [  ] CDI 为 Provider 添加 onCreate() hook 函数，可以用在某些异步初始化场景
- [  ] CDI 为 Provider 提供的 onDestroy() hook 函数支持 async await，可以用在某些异步释放资源场景，比如释放 PostgreSQL 或 Mysql 连接池
- [  ] CDI ApplicationContext 添加更快捷的函数调用，以便于在 ``ProviderContainer.instance.set(context, session?, request?)`` 更容易地使用
- [no] 考虑是否将 ``ProviderContainer.instance.set`` 简化为 ``providerContainer.register`` 等等
- [no] 考虑是否将 ``SQLTemplateContainer.instance.transform`` 简化为 ``pgTemplateContainer.transform`` 等等
- [  ] 考虑是否将 CDI ApplicationContext 提供外界访问
- [  ] 考虑使用标准库 url.Url 替代 http.Uri
- [  ] 考虑更新 ProviderContainer API：

       - ProviderContainer.instance.register(scope, key, provider)
       - ProviderContainer.instance.unregister(scope, key)
       - ProviderContainer.instance.has(scope, key)
       - ProviderContainer.instance.find(scope, key, provider)