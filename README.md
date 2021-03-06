# 小さな会社のための打刻管理アプリケーション<br>GoogleAppScript + Slack連携


## 概要
出退勤時の打刻や、付随情報の登録/削除/閲覧ができる画面を提供します。  
１）Google Apps Scriptを用いて、HTML画面からGoogle Spread Sheetへのデータ登録/削除等をおこないます。  
２）SlackのSlashCommandsを用いて、Google Spread Sheetへのデータ登録（出勤登録）をおこないます。  

![](https://user-images.githubusercontent.com/42574464/44407310-bbd96a00-a598-11e8-9fac-f1ba6631d7aa.png)

<br>

## 機能

|  No.  |  メニュー  | 概要 |
| ---- | ---- | ---- |
|  1  |  打刻  | ・出勤/退勤の打刻をおこなう。<br>・遅刻/残業判定をおこなう。<br>・ログインユーザー情報を表示する。<br>・3ヶ月分(当月/前月/翌月)の打刻一覧を表示する。<br> |
|  2  |  備考登録  | ・備考の登録/削除をおこなう。<br>・ログインユーザー情報を表示する。<br>・3ヶ月分(当月/前月/翌月)の打刻一覧を表示する。 |
|  3  |  勤怠区分登録  | ・勤怠区分の登録/削除をおこなう。<br>・ログインユーザー情報を表示する。<br>・3ヶ月分(当月/前月/翌月)の打刻一覧を表示する。 |
|  4  |  打刻修正  | ・休憩時間の修正をおこなう<br>・ログインユーザー情報を表示する。<br>・3ヶ月分(当月/前月/翌月)の打刻一覧を表示する。 |
|  5  |  稼働実績  | ・1年分の稼働実績一覧を表示する。<br>・ログインユーザー情報を表示する。 |
|  6  |  その他  | ・ログインユーザー情報を表示する。<br>・・提出用勤務表を出力する。<br>・マニュアルをリンクする。 |

<br>

## 画面イメージ
### Web画面
![](https://user-images.githubusercontent.com/42574464/44417434-79bc2280-a5b0-11e8-9766-4bc9984702db.png)

### Slack画面
![](https://user-images.githubusercontent.com/42574464/44418204-b0933800-a5b2-11e8-8953-3bc50de76b45.png)

<br>

## 導入手順1 ： ファイル作成

下記を参考に、GoogleAppsScriptおよびGoogleSpreadSheetを作成してください。  
※GoogleSpreadSheetは、対象のユーザーに編集権限を付与してください。

### ソースコード

|  GoogleAppsScriptファイル名  |  内包ファイル  | 参考コード |
| ---- | ---- | ---- |
|  ohayo  |  ohayo.gs  | ohayo.js |
|  app  |  app.gs<br>index.html  | app.js<br>index.html |

GoogleAppsScriptのgsファイルに、jsファイルの内容をコピーして貼り付けてください。  
index.html以外のファイル名は任意の名称で設定しても問題ありません。

### GoogleSpreadSheet

|  GoogleSpreadSheetファイル名  |  概要  |
| ------ | ---- |
|  USER  |  googleユーザーID, SlackユーザーID, 個人のスプレットシートID等を管理します。  |
|  SAMPLE  |  勤務表の雛形です。  |
|  DATA  |  個人の打刻実績を管理します。  |

シート名、シート内容等は、すべてリポジトリーのフォーマットと同じにするよう注意してください。  
SAMPLE, DATAファイル名については、任意の名称で設定しても問題ありません。

<br>

## 導入手順2 ： GoogleAppsScriptの公開とSlack連携

・GoogleAppsScript（appファイルとohayoファイル）をウェブアプリケーションとして公開してください。  
・SlackのSlash Commands APIで任意の文字列を登録し、GoogleAppsScript(ohayoファイル)を連携してください。  
　参考：https://qiita.com/chikuwa111/items/7a1a349b82318a5861cc

<br>

## 導入手順3 ： コード内設定値修正

修正箇所に文字列が設定されているので、修正方法にしたがって置き換えてください。

|  ファイル名  |  修正箇所  | 修正方法 |
| ---- | ---- | ---- |
|  ohayo.gs  |  "modify_1"<br>"modify_2" | SlackのTokenを設定<br>USER SpreadSheetのIDを設定 |
|  app.gs  |  "modify_1"<br>"modify_2"  | USER SpreadSheetのIDを設定<br>SAMPLE SpreadSheetのIDを設定 |
|  index.html  |  "modify_1"<br>"modify_2"  | GoogleAppsScriptをウェブアプリケーションとして公開するときに得られるURLを設定<br>USER SpreadSheetのIDを設定 |

