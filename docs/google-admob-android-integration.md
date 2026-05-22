# Cocos Creator Android 接入 Google AdMob 记录

本文档整理本项目在 Cocos Creator 接入 Google AdMob 并发布 Android 平台时遇到的问题、原因、修复方式和后续构建检查项。

当前项目环境参考：

- Cocos Creator：3.8.6
- Android 包名：`com.zmrlft.droom`
- 当前本地 AdMob 插件目录：`extensions/Google AdMob`
- Android 构建输出目录示例：`build/android-001/proj`
- 原生工程目录：`native/engine/android`

## 1. Cocos 构建面板设置

在 Cocos Creator 中打开 `项目 -> 构建发布 -> Android`，建议按以下方式配置。

### 1.1 Android 基础设置

- `Platform`：Android
- `Build Path`：`project://build`
- `Output Name`：随便写 `android`、`android-001` 都可，但每次新建目录都要重新检查 Android Studio 配置
- `Package Name`：`com.zmrlft.droom`
- `Start Scene`：项目启动场景
- `Main Bundle Compression Type`：保持项目当前配置即可，本项目使用 `merge_dep`
- `Orientation`：只启用 `Portrait`
- `Landscape Left`：关闭
- `Landscape Right`：关闭
- `Upside Down`：按需求关闭，本项目关闭
- `Resizeable Activity`：可保持开启
- `Max Aspect Ratio`：本项目使用 `2.4`
- `API Level`：建议至少 35
- `ABI`：至少包含 `arm64-v8a`
- `Use Debug Keystore`：开发测试可以开启，正式发布必须关闭并配置 release keystore
- `Generate App Bundle`：发布 Google Play 时应开启，生成 AAB

注意：Cocos 的构建配置会写入 `profiles/v2/packages/android.json`。如果已有多个 `taskOptionsMap`，只改一个构建任务可能不够，应在构建面板中确认当前使用的任务确实是 `Portrait`。如果新生成项目又变横屏，优先检查这个文件里当前任务的 `orientation`。

### 1.2 Google AdMob 插件设置

在 Android 构建面板中确认 AdMob 插件设置：

- `Enable AdMob`：开启
- `Application ID`：填写 AdMob App ID，格式是带 `~` 的 ID，例如 `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`
- `Force overwrite the libadmob`：开发阶段可以开启；如果手动修改了生成目录里的 `libadmob`，则不要开启，否则会被插件模板覆盖

本项目当前配置示例：

```json
{
  "enableAdMob": "true",
  "overwriteLibrary": "true",
  "applicationId": "ca-app-pub-7685009584349373~8655623906"
}
```

## 2. 广告代码设置

横幅广告代码位于：

```text
assets/Scripts/Ad/AdManager.ts
```

当前开发阶段使用 Google 官方测试横幅广告位：

```ts
const BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/9214589741'
```

正式发布前再切换为自己的真实 Banner Unit ID，例如：

```ts
// 'ca-app-pub-7685009584349373/4809089686'
```

开发和测试阶段不要请求、点击真实广告，否则可能触发 AdMob 无效流量风险。

当前横幅建议使用竖屏自适应尺寸：

```ts
{
  type: BannerSizeType.Portrait,
  size: BannerSize.BANNER,
  alignments: BottomCenter,
}
```

横幅加载位置在：

```text
assets/Scripts/UI/StartManager.ts
```

当前逻辑是在 Start 场景 `onLoad()` 中调用：

```ts
AdManager.Instance.initBanner()
```

## 3. 为什么 Battle 场景也会显示横幅

AdMob 横幅不是 Cocos 场景节点，而是 Android 原生 View，挂在当前 Activity 上。

因此：

- 在 Start 场景加载一次 Banner 后，切换到 Battle 场景不会自动销毁
- `AdManager` 是单例，`director.loadScene()` 不会清掉它
- Banner 会持续显示，直到手动隐藏或销毁

如果只希望 Start 场景显示横幅，在切换场景前调用：

```ts
AdManager.Instance.hideBanner()
director.loadScene(SCENE_ENUM.Battle)
```

如果希望彻底销毁：

```ts
AdManager.Instance.destroy()
director.loadScene(SCENE_ENUM.Battle)
```

也可以在 `BattleManager.onLoad()` 中再次调用 `hideBanner()` 或 `destroy()`，作为兜底。

## 4. AppActivity 必须初始化 AdServiceHub

Google AdMob 插件 Android 端依赖 `AdServiceHub` 初始化原生服务和 JSB bridge。没有这个初始化，TS 侧 `BannerClient.load()` 会调用，但原生层没有正确接收和处理，因此广告不会显示。

需要在：

```text
native/engine/android/app/src/com/cocos/game/AppActivity.java
```

添加：

```java
import com.cocos.admob.AdServiceHub;
```

在 `onCreate()` 中：

```java
SDKWrapper.shared().init(this);
AdServiceHub.instance().init(this);
```

在 `onDestroy()` 中：

```java
SDKWrapper.shared().onDestroy();
AdServiceHub.instance().destroy();
```

本项目也同步修改了 Instant App 入口：

```text
native/engine/android/instantapp/src/com/cocos/game/InstantActivity.java
```

如果以后重新生成原生工程后广告又不显示，优先检查 `AppActivity.java` 是否仍包含上述三处内容。

## 5. 竖屏问题

问题现象：

- 模拟器启动后是横屏
- 竖屏游戏被放大，只能看到局部画面

原因：

- Cocos Android 构建任务中 `portrait=false`
- `landscapeLeft=true`
- `landscapeRight=true`
- 生成的 Android Manifest 中为 `sensorLandscape`

修复目标：

```json
"orientation": {
  "portrait": true,
  "upsideDown": false,
  "landscapeRight": false,
  "landscapeLeft": false
}
```

同时确认：

```text
native/engine/android/app/AndroidManifest.xml
```

核心 Activity 应为：

```xml
android:screenOrientation="portrait"
```

如果每次重新构建又变横屏，说明 Cocos 构建面板中的当前任务仍是横屏配置，需要回到构建面板重新选择 `Portrait` 并保存。

## 6. Java 21 与 Gradle 8.0.2 不兼容

问题现象：

```text
Your build is currently configured to use incompatible Java 21.0.8 and Gradle 8.0.2.
The minimum compatible Gradle version is 8.5.
The maximum compatible Gradle JVM version is 19.
```

原因：

- Cocos 3.8.6 默认生成的 Gradle wrapper 可能是 `8.0.2`
- Android Studio 当前使用 Java 21
- Gradle 8.0.2 不能运行在 Java 21 上

推荐修复方式：

1. 在 Android Studio 中将 `Gradle JDK` 改为 JDK 17。
2. 或者将 Gradle wrapper 改为 8.5。

本项目对生成工程使用过：

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
```

不要升级到 `Gradle 9.0-milestone-1`，那是预览版，不适合当前 Cocos 工程。

如果无法自动下载 Gradle，可以手动下载：

```text
https://services.gradle.org/distributions/gradle-8.5-bin.zip
```

放入 Gradle wrapper 缓存目录，例如：

```text
C:\Users\26438\.gradle\wrapper\dists\gradle-8.5-bin\<hash>\
```

目录中应包含：

```text
gradle-8.5-bin.zip
gradle-8.5\bin\gradle.bat
gradle-8.5-bin.zip.ok
```

## 7. minSdkVersion 与 Google Mobile Ads SDK 冲突

问题现象：

```text
uses-sdk:minSdkVersion 21 cannot be smaller than version 23 declared in library [com.google.android.gms:play-services-ads:24.9.0]
```

原因：

- 项目默认 `minSdkVersion` 是 21
- 新版本 Google Mobile Ads SDK 要求最低 23

修复：

在生成工程的：

```text
build/android-001/proj/gradle.properties
```

设置：

```properties
PROP_MIN_SDK_VERSION=23
```

不要使用：

```xml
tools:overrideLibrary
```

该方式只是绕过 Manifest 检查，可能导致 Android 5.x 设备运行时崩溃。

## 8. Android 35 android.jar 资源链接失败

问题现象：

```text
Android resource linking failed
Failed to load resources table in APK '...\platforms\android-35\android.jar'
RES_TABLE_TYPE_TYPE entry offsets overlap actual entry data
```

原因：

- 项目使用 `compileSdk 35`
- Cocos 默认 AGP 8.0.2 的 AAPT2 太旧
- 旧 AAPT2 不能正确读取 Android 35 的 `android.jar`

修复：

在生成工程的 `gradle.properties` 中设置：

```properties
PROP_BUILD_TOOLS_VERSION=35.0.0
android.aapt2FromMavenOverride=C:\\Users\\26438\\Documents\\AndroidSdk\\build-tools\\35.0.0\\aapt2.exe
```

长期方案是升级 AGP 到更高版本，但 Cocos 3.8.6 默认模板较旧，直接升级 AGP 可能引入新的兼容问题。

## 9. NDK r27 与 Cocos r21~23 限制

问题现象：

```text
NDK r27 is detected Creator requires NDK r21~23
```

原因：

- Cocos Creator 3.8.6 构建面板校验 NDK 版本，只接受 r21~r23
- Google Play Android 15+ 16 KB page size 要求又需要使用更新 NDK 或正确链接参数

当前可行流程：

1. 在 Cocos 构建面板中继续使用 r22/r23，让 Cocos 能正常生成 Android 工程。
2. Cocos 生成工程后，在 Android Studio/Gradle 阶段修改生成工程：

```properties
PROP_NDK_PATH=C:\\Users\\26438\\Documents\\AndroidSdk\\ndk\\27.1.12297006
```

不要直接在 Cocos 面板里强行配置 r27，否则 Cocos 会拒绝。

## 10. Google Play 16 KB page size 问题

问题现象：

```text
APK is not compatible with 16 KB devices.
Some libraries have LOAD segments not aligned at 16 KB boundaries:
lib/arm64-v8a/libEGL.so
lib/arm64-v8a/libcocos.so
```

原因：

- 旧 NDK 构建出来的 `.so` ELF LOAD segment 没有 16 KB 对齐
- Google Play 从 2025 年 11 月 1 日起要求目标 Android 15+ 的应用支持 16 KB page size

修复：

在生成工程中将 NDK 切到 r27.1：

```properties
PROP_NDK_PATH=C:\\Users\\26438\\Documents\\AndroidSdk\\ndk\\27.1.12297006
```

在：

```text
native/engine/android/CMakeLists.txt
```

添加：

```cmake
if(ANDROID)
    set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384 -Wl,-z,common-page-size=16384")
endif()
```

然后必须 clean rebuild：

```powershell
cd C:\cc\cocos-start-demo-master\build\android-001\proj
.\gradlew.bat clean
.\gradlew.bat :droom:bundleRelease
```

说明：

- 以上主要解决 ELF segment 对齐
- 如果后续 Google Play 再报 zip alignment，需要考虑升级 AGP 到 8.5.1+
- Cocos 3.8.6 默认 AGP 较旧，升级前应单独验证

## 11. libadmob build.gradle 的 Value is null 问题

问题现象：

```text
A problem occurred evaluating project ':libadmob'.
Value is null
```

原因：

AdMob 插件模板中的：

```text
extensions/Google AdMob/template/android/libadmob/build.gradle
```

原先使用：

```gradle
minSdk PROP_MIN_SDK_VERSION
targetSdk PROP_TARGET_SDK_VERSION
```

该写法在当前 Gradle/AGP 组合下不稳定。

修复为：

```gradle
minSdkVersion PROP_MIN_SDK_VERSION.toInteger()
targetSdkVersion PROP_TARGET_SDK_VERSION.toInteger()
```

需要同时修复：

- 插件模板：`extensions/Google AdMob/template/android/libadmob/build.gradle`
- 当前生成工程：`build/android-001/proj/libadmob/build.gradle`

如果只改生成工程，下次 Cocos 重新构建新目录时仍会复发。

## 12. R8 缺失 errorprone 注解类

问题现象示例：

```text
Missing class javax.lang.model.element.Modifier
Missing class com.google.errorprone.annotations.CanIgnoreReturnValue
```

原因：

`nativetemplates` 里使用了 `error_prone_annotations` 注解库。该库只应作为编译期依赖，但 release R8 混淆会检查这些注解引用，导致缺失类错误。

修复：

在：

```text
extensions/Google AdMob/template/android/googleads-mobile-android-native-templates-main/nativetemplates/build.gradle
```

将：

```gradle
implementation 'com.google.errorprone:error_prone_annotations:2.16'
```

改为：

```gradle
compileOnly 'com.google.errorprone:error_prone_annotations:2.16'
```

在：

```text
extensions/Google AdMob/template/android/googleads-mobile-android-native-templates-main/nativetemplates/proguard-rules.pgcfg
```

添加：

```proguard
-dontwarn javax.lang.model.element.Modifier
-dontwarn com.google.errorprone.annotations.**
```

同样需要同步到当前生成工程：

```text
build/android-001/proj/nativetemplates/build.gradle
build/android-001/proj/nativetemplates/proguard-rules.pgcfg
```

如果 R8 继续报其他缺失类，可查看自动生成的：

```text
build/android-001/proj/build/droom/outputs/mapping/release/missing_rules.txt
```

该文件会给出需要补充的 `-dontwarn` 规则。

## 13. namespace 相关说明

网上有教程提到需要修改：

```text
extensions/Google AdMob/template/android/googleads-mobile-android-native-templates-main/nativetemplates/src/main/build.gradle
extensions/Google AdMob/template/android/libadmob/build.gradle
```

本项目当前插件目录中并不存在：

```text
nativetemplates/src/main/build.gradle
```

正确文件是：

```text
extensions/Google AdMob/template/android/googleads-mobile-android-native-templates-main/nativetemplates/build.gradle
```

当前模板中 `libadmob` 和 `nativetemplates` 都已经有 `namespace` 配置，因此没有出现 `Namespace not specified` 错误时，不需要额外修改 namespace。

只有在 Android Studio 明确报：

```text
Namespace not specified
```

时，才需要补 namespace。

## 14. 为什么每次 Cocos 重新生成 Android 项目都会出现新问题

Cocos 生成 Android 工程时，会从多个来源复制和生成文件：

- Cocos 自身的 Android 模板
- `native/engine/android`
- `extensions/Google AdMob/template/android`
- `profiles/v2/packages/android.json`
- `profiles/v2/packages/admob.json`

因此如果只修改：

```text
build/android-001/proj
```

下次新建：

```text
build/android-002/proj
```

问题可能会重新出现。

更稳定的做法：

- 能改插件模板的，改 `extensions/Google AdMob/template/android`
- 能改 Cocos 原生入口的，改 `native/engine/android`
- 每次新构建后再检查生成工程中的 `gradle.properties`
- 不要只依赖一次性的 Android Studio 修改

## 15. 构建后检查清单

每次 Cocos 重新生成 Android 工程后，进入：

```text
build/android-xxx/proj
```

检查以下内容。

### 15.1 gradle-wrapper.properties

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
```

或使用 Android Studio 的 JDK 17 运行旧 Gradle。

### 15.2 gradle.properties

```properties
PROP_COMPILE_SDK_VERSION=35
PROP_MIN_SDK_VERSION=23
PROP_TARGET_SDK_VERSION=35
PROP_BUILD_TOOLS_VERSION=35.0.0
android.aapt2FromMavenOverride=C:\\Users\\26438\\Documents\\AndroidSdk\\build-tools\\35.0.0\\aapt2.exe
PROP_NDK_PATH=C:\\Users\\26438\\Documents\\AndroidSdk\\ndk\\27.1.12297006
```

### 15.3 libadmob/build.gradle

应包含：

```gradle
namespace "com.cocos.admob"
minSdkVersion PROP_MIN_SDK_VERSION.toInteger()
targetSdkVersion PROP_TARGET_SDK_VERSION.toInteger()
```

### 15.4 nativetemplates/build.gradle

应包含：

```gradle
namespace "com.google.android.ads.nativetemplates"
compileOnly 'com.google.errorprone:error_prone_annotations:2.16'
```

### 15.5 nativetemplates/proguard-rules.pgcfg

应包含：

```proguard
-dontwarn javax.lang.model.element.Modifier
-dontwarn com.google.errorprone.annotations.**
```

### 15.6 AppActivity.java

应包含：

```java
import com.cocos.admob.AdServiceHub;
AdServiceHub.instance().init(this);
AdServiceHub.instance().destroy();
```

### 15.7 AndroidManifest.xml

应包含：

```xml
android:screenOrientation="portrait"
```

## 16. 推荐构建命令

在 Android Studio 中同步成功后，可使用命令行验证：

```powershell
cd C:\cc\cocos-start-demo-master\build\android-001\proj
.\gradlew.bat clean
.\gradlew.bat :droom:assembleRelease
```

发布 Google Play 时构建 AAB：

```powershell
.\gradlew.bat :droom:bundleRelease
```

如果构建 release 时只是为了本地调试，也可以临时关闭 minify，但不建议作为最终方案。

相关配置在：

```text
native/engine/android/app/build.gradle
```

Release 块中：

```gradle
minifyEnabled true
shrinkResources true
```

临时调试可改为：

```gradle
minifyEnabled false
shrinkResources false
```

正式发布前建议恢复并解决 R8 规则。

## 17. 真机或模拟器运行广告的要求

AdMob 广告运行时需要：

- 设备或模拟器安装 Google Play Services
- 网络可以访问 Google 服务
- 使用 Google Play 镜像的模拟器，而不是纯 AOSP 镜像
- 开发阶段使用测试广告位
- 查看 Logcat 中的 `Banner load failed:` 定位加载失败原因

如果使用测试广告位仍不显示，优先检查：

- `AppActivity.java` 是否初始化 `AdServiceHub`
- `Enable AdMob` 是否开启
- AdMob App ID 是否写入 Manifest
- 模拟器是否为 Google Play 镜像
- Logcat 是否出现 no fill、network、Google Play Services 相关错误

## 18. 发布前注意事项

发布 Google Play 前应完成：

- 使用正式 keystore，不要使用 debug keystore
- 构建 AAB，而不是仅上传 APK
- 确认包名 `com.zmrlft.droom` 不再变更
- 确认 `minSdkVersion >= 23`
- 确认 `targetSdkVersion >= 35`
- 确认 `arm64-v8a` 原生库支持 16 KB page size
- 替换为正式 AdMob Banner Unit ID
- 配置隐私政策
- 在 Play Console Data Safety 中声明广告 SDK 与相关数据使用
- 如果面向 EEA/UK 用户，需要处理用户同意流程

## 19. 建议的长期方案

当前方案是在 Cocos Creator 3.8.6 和官方 AdMob 插件旧模板基础上做兼容补丁。长期更稳的方案是：

- 升级到 Cocos 官方已适配 16 KB page size 的版本
- 使用更新版本的 Google AdMob 插件
- 统一升级 Android Gradle Plugin、Gradle、NDK、Google Mobile Ads SDK
- 将本次补丁整理成自动化 post-build 脚本，避免每次生成 `android-xxx` 后手工修改

在未升级前，每次重新生成 Android 工程，都应按本文档的检查清单复核。
