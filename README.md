WebNode
=========

A web framework that focuses on efficiency and agility. Implemented context and dependency injection inspired by Java EE CDI and .Net core dependency injection.


TODO List
----------

- [  ] CDI ApplicationContext 添加更快捷的函数调用，以便于在 ``ProviderContainer.instance.set(context, session?, request?)`` 更容易地使用
- [no] 考虑是否将 ``SQLTemplateContainer.instance.transform`` 简化为 ``pgTemplateContainer.transform`` 等等