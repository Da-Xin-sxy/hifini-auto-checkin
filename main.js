const signPageUrl = "https://www.hifiti.com/sg_sign.htm";
const responseSuccessCode = "0";

async function checkIn(account) {
  console.log(`【${account.name}】: 开始签到...`);

  const response = await fetch(signPageUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      Cookie: account.cookie,
    },
  });

  if (!response.ok) {
    throw new Error(`网络请求出错 - ${response.status}`);
  }

  const responseJson = await response.json();

  if (responseJson.code === responseSuccessCode) {
    console.log(`【${account.name}】: 签到成功。`);
    return responseJson.message;
  } else {
    if (responseJson.message === "今天已经签过啦！") {
      console.log(`【${account.name}】: ${responseJson.message}`);
      return responseJson.message;
    }
    throw new Error(`签到失败: ${responseJson.message}`);
  }
}

// 处理
async function processSingleAccount(account) {
  const checkInResult = await checkIn(account);

  return checkInResult;
}

async function main() {
  let accounts;

  // if (process.env.ACCOUNTS) {
  //   try {
  //     accounts = JSON.parse(process.env.ACCOUNTS);
  //   } catch (error) {
  //     console.log("❌ 账户信息配置格式错误。");
  //     process.exit(1);
  //   }
  // } else {
  //   console.log("❌ 未配置账户信息。");
  //   process.exit(1);
  // }
  accounts = JSON.parse('[
  {
    "name": "843646876@qq.com",
    "cookie": "bbs_sid=5vgfnamkr1tav3akfvqmmk3jdf; Hm_lvt_23819a3dd53d3be5031ca942c6cbaf25=1757125632; HMACCOUNT=C3139989CA662350; bbs_token=zp_2FW3ebxM0eg0vH8lULswbogLFOIFEAxi_2FZB1JFqi_2B8uJ_2BLILb7A4qfyy8ok5YLlbdNcyoJrM_2FRV2rI3M6im_2FAWbBr4_3D; Hm_lpvt_23819a3dd53d3be5031ca942c6cbaf25=1757129156"
  }
]')

  const allPromises = accounts.map((account) => processSingleAccount(account));
  const results = await Promise.allSettled(allPromises);

  console.log(`\n======== 签到结果 ========\n`);
  let hasError = false;

  results.forEach((result, index) => {
    const accountName = accounts[index].name;
    if (result.status === "fulfilled") {
      console.log(`【${accountName}】: ✅ ${result.value}`);
    } else {
      console.error(`【${accountName}】: ❌ ${result.reason.message}`);
      hasError = true;
    }
  });

  if (hasError) {
    process.exit(1);
  }
}

main();
