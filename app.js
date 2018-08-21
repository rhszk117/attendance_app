function myFunction() {

}

/*----------------------------------------------------
 * html表示関数
 *  処理内容
 *   htmlを表示する
 *  関数名
 *   doGet
 *  引数
 *   なし
 *  戻り値
 *   html.evaluate(）；
*-------------------------------------------------- */
//function doGet(e) {
function doGet() {
  var html = HtmlService.createTemplateFromFile('index');
  return html.evaluate();
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
 *     punchOut_limit, ： 残業の判定基準となる時間?
 *     break_time　　　　　　　　　　 ： 休憩時間
 *   ]
*-------------------------------------------------- */
function getUserInfo(user_name){
  var id = 'modify_1';
  var sheet_name = 'USER';
  var spreadSheet = SpreadsheetApp.openById(id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  var dat = sheet.getDataRange().getValues();

  for(var i=1;i<dat.length;i++){
    if(dat[i][2] == user_name){
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
 * 残業チェック関数
 *  処理内容
 *   残業チェックする
 *  関数名
 *   punchOutLimitCheck
 *  引数
 *   time        ： 登録時間
 *   limit_time  ： 残業の判定基準となる時間
 *  戻り値
 *   ’遅刻'       ： 対象セルに書き込む文字列
 *   ''          ： 対象セルに書き込む文字列
*-------------------------------------------------- */
function punchOutLimitCheck(time, limit_time){
  if (time > Utilities.formatDate(limit_time, 'Asia/Tokyo', "HH:mm")){
    return '残業';
  } else {
    return '';
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
function punchIn(form) {
  //対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  //対象シート取得
  var sheet_name = form.month;
  
  //
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 登録データ取得
  var punchIn_date = form.date;
  var punchIn_time = form.time;
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
    range.setValue(punchIn_late);
  }
}

/*----------------------------------------------------
 * 退勤登録処理関数
 *  処理内容
 *   出勤打刻ボタン押下時の処理
 *  関数名
 *   punchOut
 *  引数
 *   form       ： 退勤ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function punchOut(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var sheet_name = form.month;
  
  //
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 登録データ取得
  var punchOut_date = form.date;
  var punchOut_time = form.time;
  var col = 1;
  
  // 残業チェック
  var punchOut_limit_time = user_info[2];
  var punchOut_late = punchOutLimitCheck(punchOut_time, punchOut_limit_time)
  
  // 休憩時間デフォルト値取得
  var break_time = user_info[3];
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, punchOut_date, col);
  
  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 5);
    range.setValue(punchOut_date);
    var range = sheet.getRange(check_date, 7);
    range.setValue(punchOut_time);
    var range = sheet.getRange(check_date, 10);
    range.setValue(punchOut_late);
    var range = sheet.getRange(check_date, 8);
    range.setValue(break_time);
    
  }
}

/*----------------------------------------------------
 * 備考登録関数
 *  処理内容
 *   備考登録
 *  関数名
 *   commentInsert
 *  引数
 *   form       ： 備考登録ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function commentInsert(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var target_month = form.comment_date;
  var sheet_name = target_month.substring(5,7);
  
  // 
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 登録データ取得
  var comment_date = form.comment_date;
  var comment = form.comment;
  var col = 1;
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, comment_date, col);
  
  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 12);
    range.setValue(comment);
  }
}

/*----------------------------------------------------
 * 備考削除関数
 *  処理内容
 *   備考削除
 *  関数名
 *   commentDelete
 *  引数
 *   form      ： 備考削除ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function commentDelete(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var target_month = form.comment_date;
  var sheet_name = target_month.substring(5,7);
  
  // 
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 削除データ取得
  var comment_date = form.comment_date;
  var col = 1;
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, comment_date, col);
  
  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 12);
    range.setValue('');
  }
}

/*----------------------------------------------------
 * 勤怠区分登録関数
 *  処理内容
 *   備考登録
 *  関数名
 *   categoryInsert
 *  引数
 *   form      ： 勤怠区分登録ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function categoryInsert(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var target_month = form.category_date;
  var sheet_name = target_month.substring(5,7);
  
  // 
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 登録データ取得
  var category_date = form.category_date;
  var category = form.category;
  var col = 1;
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, category_date, col);

  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 11);
    range.setValue(category);
  }
}

/*----------------------------------------------------
 * 勤怠区分削除関数
 *  処理内容
 *   備考削除
 *  関数名
 *   categoryDelete
 *  引数
 *   form      ： 勤怠区分削除ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function categoryDelete(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var target_month = form.category_date;
  var sheet_name = target_month.substring(5,7);
  
  // 
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 削除データ取得
  var category_date = form.category_date;
  var col = 1;
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, category_date, col);

  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 11);
    range.setValue('');
  }
}


/*----------------------------------------------------
 * 休憩時間修正関数
 *  処理内容
 *   休憩時間更新
 *  関数名
 *   breakUpdate
 *  引数
 *   form      ： 修正ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function breakUpdate(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var target_month = form.break_date;
  var sheet_name = target_month.substring(5,7);
  
  // 
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  //修正データ取得
  var break_date = form.break_date;
  var break_time = form.break_time;
  var col = 1;
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, break_date, col);

  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 8);
    range.setValue(break_time);
  }
}

/*----------------------------------------------------
 * 休憩時間修正関数
 *  処理内容
 *   休憩時間削除
 *  関数名
 *   breakDelete
 *  引数
 *   form      ： 修正ボタン押下時に送信されるデータ
*-------------------------------------------------- */
function breakDelete(form) {
  // 対象ファイル取得
  var user_info = getUserInfo(form.user_name);
  var file_id = user_info[0];
  
  // 対象シート取得
  var target_month = form.break_date;
  var sheet_name = target_month.substring(5,7);
  
  // 
  var spreadSheet = SpreadsheetApp.openById(file_id);
  var sheet = spreadSheet.getSheetByName(sheet_name);
  
  // 削除データ取得
  var break_date = form.break_date;
  var col = 1;
  
  // 当該セル行検索処理
  var check_date = findRow(sheet, break_date, col);

  // 登録処理
  if (check_date != 0) {
    var range = sheet.getRange(check_date, 8);
    range.setValue('');
  }
}

/*----------------------------------------------------
 * 勤怠表整形用情報取得関数
 *  処理内容
 *   ログインユーザーの情報を取得する
 *  関数名
 *   getUserInfo
 *  引数
 *   user_name         : 氏名
 *  戻り値
 *   result = [
 *     day,           : 日付
 *     week,          : 曜日
 *     holiday,       : 祝日
 *     punchIn_limit, ： 遅刻の判定基準となる時間
 *     punchOut_limit,： 残業の判定基準となる時間
 *     break_time,    ： 休憩時間
 *     sum,           : 勤務時間
 *     category,      : 勤怠区分
 *     comment        : 備考
 *   ]
*-------------------------------------------------- */
function getRosterData(user_name, month){
  var user_info = getUserInfo(user_name);
  var id = user_info[0];
  var sheet_name = month;
  var spreadSheet = SpreadsheetApp.openById(id);
  var sheet = spreadSheet.getSheetByName(sheet_name);

  var last_row = sheet.getLastRow();
  var m = 0;
  for (var i = 1; i < last_row; i++) {
    var value = sheet.getRange(i, 1).getValue();
    if (value === '') {
      m = i;
      break;
    }
  }　// 日付列のセルがすべて埋まっていることを前提とする

  var range = sheet.getRange(2, 1, m-2);
  var day = range.getValues();
  var range = sheet.getRange(2, 2, m-2);
  var week = range.getValues();
  var range = sheet.getRange(2, 3, m-2);
  var holiday = range.getValues();
  var range = sheet.getRange(2, 6, m-2);
  var punchIn_time = range.getValues();
  var range = sheet.getRange(2, 7, m-2);
  var punchOut_time = range.getValues();
  var range = sheet.getRange(2, 8, m-2);
  var break_time = range.getValues();
  var range = sheet.getRange(2, 13, m-2);
  var sum = range.getValues();
  var range = sheet.getRange(2, 11, m-2);
  var category = range.getValues();
  var range = sheet.getRange(2, 12, m-2);
  var comment = range.getValues();
  var result = [
    day,
    week,
    holiday,
    punchIn_time,
    punchOut_time,
    break_time,
    sum,
    category,
    comment
  ];
  
  return result;
}

/*----------------------------------------------------
 * 勤務表整形関数
 *  処理内容
 *   整形した勤怠表作成
 *  関数名
 *   createRoster
 *  引数
 *   form  ： 勤務表出力ボタン押下時に送信されるデータ
 *  戻り値
 *   -
*-------------------------------------------------- */
function createRoster(form) {
  // ファイル名作成
  // この後に"_YYYYMMDDHHmm"を連結
  var file_name = '勤務表';
  
  // ファイル名の日付部分
  var date = new Date();
  var formatted_date = Utilities.formatDate(date, "Asia/Tokyo", "yyyyMMddHHmm");

  // ファイル名が全角で打てないので全角変換
  // ファイル名を全角にする必要がなければ削除
  file_name = file_name.replace(/[A-Za-z0-9]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
  });

  // コピーをマイドライブ直下に作成
  var base_file_id = 'modify_2';
  var base_file = DriveApp.getFileById(base_file_id);
  var root_folder = DriveApp.getRootFolder(); 
  var copy_file = base_file.makeCopy((file_name + "_" + formatted_date), root_folder);
  
  // コピーファイルid取得
  var copy_file_id = copy_file.getId();
  
  // 対象データ取得
  var user_name = form.user_name;
  var month = form.roster_month;
  var data = getRosterData(user_name, month);
  
  // コピー先に出力
  var spreadSheet = SpreadsheetApp.openById(copy_file_id);
  var sheet = spreadSheet.getSheetByName('シート1');

  // 各データ出力先の対象列番号定義
  var obj = {
    'date'         : [data[0], 2],
    'week'         : [data[1], 3],
    'holiday'      : [data[2], 4],
    'punchIn_time' : [data[3], 5],
    'punchOut_time': [data[4], 6],
    'break_time'   : [data[5], 7],
    'sum'          : [data[6], 8],
    'caterogy'     : [data[7], 9],
    'comment'      : [data[8], 10]
  }
  
  // 書き込み
  var range = sheet.getRange(2, 8);
  range.setValue(form.roster_company);
  var range = sheet.getRange(3, 8);
  range.setValue(form.user_name);
  var range = sheet.getRange(6, 2);
  range.setValue('2018');
  var range = sheet.getRange(6, 4);
  range.setValue(month);
  
  Object.keys(obj).forEach(function(key){
    var val = obj[key];
    var col = val[1];
    var data = val[0];

    for(i = 0; i < data.length; i++){
      
      var range = sheet.getRange(i+10, col);
      range.setBorder(true, true, true, true, false, false)
      
      if (key == 'date'){
         
        // 文字列で取得されるため、date型に戻してから変換したものを出力する
        var date = new Date(data[i][0]);
        range.setValue(Utilities.formatDate(date, 'Asia/Tokyo', 'dd'));
        
      }else if ((key == 'punchIn_time')||(key == 'punchOut_time')||(key == 'break_time')||(key == 'sum')){

        if (data[i] == ''){ 
          range.setValue(data[i]);
        }else{           
          // 文字列で取得されるため、date型に戻してから変換したものを出力する
          var date = new Date(data[i][0]);
          range.setValue(Utilities.formatDate(date, 'Asia/Tokyo', "HH:mm"));
        }
      }else{       
        range.setValue(data[i]);
      }
    }
  });
}
