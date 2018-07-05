/**
 * Created by Administrator on 2018/6/27 0027.
 */
"use strict";

//楼盘名称
exports.XPATH_PROJECT_NAME      =   "//bookml:div[@class='size21 prel mag_b10']/bookml:span[@title]";
//开发企业
exports.XPATH_COMPANY_NAME      =   "//bookml:table[@class=' w_100']/bookml:tr[1]/bookml:td[1]/bookml:span[2]";
//登记时间
exports.XPATH_REGISTER_TIME     =   "//bookml:table[@class=' w_100']/bookml:tr[1]/bookml:td[2]/bookml:span[2]";
//预（现）售楼幢
exports.XPATH_BUILDING_NO      =   "//bookml:table[@class=' w_100']/bookml:tr[2]/bookml:td[1]/bookml:span[2]";
//预（现）售证号
exports.XPATH_REGISTION_NO     =   "//bookml:table[@class=' w_100']/bookml:tr[2]/bookml:td[2]/bookml:span[2]";

//现场接受资料时间
exports.XPATH_RECEIVE_DOC_TIME      =   "//bookml:table[@class=' w_100']/bookml:tr[3]/bookml:td[1]/bookml:span[2]";
//现场接受资料地点
exports.XPATH_RECEIVE_DOC_ADDR     =   "//bookml:table[@class=' w_100']/bookml:tr[3]/bookml:td[2]/bookml:div";

//索引号
exports.XPATH_INDEX_NO              =   "//bookml:tr/bookml:td[1]";
//标题
exports.XPATH_TITLE              =   "//bookml:tr/bookml:td[2]/bookml:a/@title";
//发布时间
exports.XPATH_PUBLISH_TIME              =   "//bookml:tr/bookml:td[4]";
//文件页面链接
exports.XPATH_FILE_PAGE_LINK              =   "//bookml:tr/bookml:td[2]/bookml:a/@href";

//文件链接
exports.XPATH_FILE_LINK              =   "//bookml:p/bookml:a/@href";

exports.dvosdbHost = '111.62.8.85';
exports.dvosdbPort = 3306;
exports.dvosdbUser = 'freeswitch';
exports.dvosdbPassword = 'freeswitch';
exports.dvosdbDSN = 'house';