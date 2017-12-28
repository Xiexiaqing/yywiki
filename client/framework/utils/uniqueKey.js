export default function getUniqueKey() {
    let now_time = new Date().getTime();
    let random_num = Math.round(Math.random(1, 1000) * 1000);

    return now_time + random_num;
}