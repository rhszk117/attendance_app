/*----------------------------------------------------
 * GasアプリケーションをSlackに登録する方法
 * https://api.slack.com/apps　'Ctreate New App'をクリック
 * AppName, WorkSpace登録
 * slash commandsを選択し、必要情報を入力して保存
 * →RequestURLに本アプリケーションのURLを設定する
 * Basic InformationページにあるVerification Token
 * Install your app to your workspaceページで連携を許可する
*-------------------------------------------------- */

/*----------------------------------------------------
 *  main関数
 *  処理内容
 *   １スラックから送信された値(slashcommandsで設定する文字列('/ohayo')を取得し、スプレットシートに書き込みをする。
 *   ２処理結果をスラックに返却する
 *  関数名
 *   doPost
 *  引数
 *   e：スラックから送信される値
 *  戻り値
 *   失敗時:'token_error'
 *   成功時:　time + '@' + user_name　+ '<出勤打刻完了>'
*-------------------------------------------------- */
function doPost(e) {
  
  // 変数に取得値を格納  
  var verificationToken = e.parameter.token;  
  var command = e.parameter.text;
  var user_name = e.parameter.user_name;

　// tokenの整合性チェック  
  if (verificationToken != 'modify_1') { // AppのVerification Tokenを入れる

    // エラーをスラックに返す
    throw new Error('token_error');
  }
  
  // 時刻取得
  var date = new Date();
  var month = Utilities.formatDate(date, 'Asia/Tokyo', 'MM');
  var time = Utilities.formatDate(date, 'Asia/Tokyo', 'HH:mm');
      date = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd');
  
  
　// 出勤登録処理
  punchIn(user_name, date, month, time);
  
  // スラックに応答を返す
  var res_text = time + '@' + user_name　+ '<出勤打刻完了>';
  var response = { text: res_text };

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/*----------------------------------------------------
 * ユーザー情報取得関数
 *  処理内容
 *   ログインユーザーの情報を取得する
 *  関数名
 *   getUserInfo
 *  引数
 *   user_name         : 氏名
 *  戻り値
 *   result = [
 *     file,           : 紐付くスプレットシートid
 *     punchIn_limit,  ： 遅刻の判定基準となる時間
 *     punchOut_limit, ： 残業の判定基準となる時間
 *     break_time　　　　　　　　　　 ： 休憩時間
 *   ]
*-------------------------------------------------- */
function getUserInfo(user_name){
  var id = 'modify_2';
  var sheet_name = 'USER';
  var spreadSheet = SpreadsheetApp.openById(id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  var dat = sheet.getDataRange().getValues();

  for(var i=1;i<dat.length;i++){
    if(dat[i][6] == user_name){
      var range = sheet.getRange(i+1, 2);
      var file = range.getValue();
      var range = sheet.getRange(i+1, 4);
      var punchIn_limit = range.getValue();
      var range = sheet.getRange(i+1, 5);
      var punchOut_limit = range.getValue();
      var range = sheet.getRange(i+1, 6);
      var break_time = Utilities.formatDate(range.getValue(), 'Asia/Tokyo', "HH:mm");
      if ((file=='')||(punchOut_limit=='')||(break_time=='')){
        //return false;
      }
      var result = [file, punchIn_limit, punchOut_limit, break_time];
      return result;
    }
  }
  //return false;
}

/*----------------------------------------------------
 * 遅刻チェック関数
 *  処理内容
 *   遅刻チェックする
 *  関数名
 *   punchInLimitCheck
 *  引数
 *   time        ： 登録時間
 *   limit_time  ： 遅刻の判定基準となる時間
 *  戻り値
 *   ’遅刻'       ： 対象セルに書き込む文字列
 *   ’’          ： 対象セルに書き込む文字列
*-------------------------------------------------- */
function punchInLimitCheck(time, limit_time){
  if (time > Utilities.formatDate(limit_time, 'Asia/Tokyo', "HH:mm")){
    return '遅刻';
  } else {
    return '';
  }
  //return false;
}

/*----------------------------------------------------
 * 日付検索関数
 *  処理内容
 *   打刻ボタン押下時の日付をスプレットシートの日付から検索し、当該セル行を取得する
 *  関数名
 *   findRow
 *  引数
 *   sheet  ： 対象のシート
 *   val    ： 値
 *   col    ： 列
 *  戻り値
 *   i+1    ： 対象の行番号
*-------------------------------------------------- */
function findRow(sheet, val, col){
  var dat = sheet.getDataRange().getValues();
  for(var i=1;i<dat.length;i++){
    if(Utilities.formatDate(new Date(dat[i][col-1]),'Asia/Tokyo','yyyy/MM/dd') == val){
      return i+1;
    }
  }
  //return false;
}

/*----------------------------------------------------
 * 出勤登録処理関数
 *  処理内容
 *   出勤打刻ボタン押下時の処理
 *  関数名
 *   punchIn
 *  引数
 *   form       ： 出勤ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function punchIn(user_name, date, month, time) {
  //対象ファイル取得
  var user_info = getUserInfo(user_name);
  var file_id = user_info[0];
  Logger.log(file_id)
  
  //対象シート取得
  var sheet_name = month;
  
  //
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 登録データ取得
  var punchIn_date = date;
  var punchIn_time = time;
  var col = 1;
  
  // 遅刻チェック
  var punchIn_limit_time = user_info[1];
  var punchIn_late = punchInLimitCheck(punchIn_time, punchIn_limit_time)
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, punchIn_date, col);

  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 4);
    range.setValue(punchIn_date);
    var range = sheet.getRange(check_date, 6);
    range.setValue(punchIn_time);
    var range = sheet.getRange(check_date, 9);
    Logger.log(punchIn_time)
    range.setValue(punchIn_late);
  }
}

