export function useFormatDate(param: String, locale: String = 'id-ID') {
  // Expected parameter format: 2024-02-29T17:00:00.000Z

  const arrParam = param.replace('T', ' ').replace('Z', '').split(' ')
  const [paramDate, paramTime] = arrParam
  const dateString = paramDate.split('-')
  const timeString = paramTime.split(':')
  const [hour, minute, second] = timeString
  const [year, month, day] = dateString

  let monthString = ''
  let monthStringLong = ''

  switch (month.toString()) {
    case '01' || '1':
      monthString = locale === 'id-ID' ? 'Jan' : 'Jan'
      monthStringLong = locale === 'id-ID' ? 'Januari' : 'January'
      break
    case '02' || '2':
      monthString = locale === 'id-ID' ? 'Feb' : 'Feb'
      monthStringLong = locale === 'id-ID' ? 'Februari' : 'February'
      break
    case '03' || '3':
      monthString = locale === 'id-ID' ? 'Mar' : 'Mar'
      monthStringLong = locale === 'id-ID' ? 'Maret' : 'March'
      break
    case '04' || '4':
      monthString = locale === 'id-ID' ? 'Apr' : 'Apr'
      monthStringLong = locale === 'id-ID' ? 'April' : 'April'
      break
    case '05' || '5':
      monthString = locale === 'id-ID' ? 'Mei' : 'May'
      monthStringLong = locale === 'id-ID' ? 'Mei' : 'May'
      break
    case '06' || '6':
      monthString = locale === 'id-ID' ? 'Jun' : 'Jun'
      monthStringLong = locale === 'id-ID' ? 'Juni' : 'June'
      break
    case '07' || '7':
      monthString = locale === 'id-ID' ? 'Jul' : 'Jul'
      monthStringLong = locale === 'id-ID' ? 'Juli' : 'July'
      break
    case '08' || '8':
      monthString = locale === 'id-ID' ? 'Agu' : 'Aug'
      monthStringLong = locale === 'id-ID' ? 'Agustus' : 'August'
      break
    case '09' || '9':
      monthString = locale === 'id-ID' ? 'Sep' : 'Sep'
      monthStringLong = locale === 'id-ID' ? 'September' : 'September'
      break
    case '10':
      monthString = locale === 'id-ID' ? 'Okt' : 'Oct'
      monthStringLong = locale === 'id-ID' ? 'Oktober' : 'October'
      break
    case '11':
      monthString = locale === 'id-ID' ? 'Nov' : 'Nov'
      monthStringLong = locale === 'id-ID' ? 'November' : 'November'
      break
    case '12':
      monthString = locale === 'id-ID' ? 'Des' : 'Dec'
      monthStringLong = locale === 'id-ID' ? 'Desember' : 'December'
      break
    default:
      break
  }

  const hourMod = Number(hour) - 12
  let amper = 'AM'

  if (hourMod >= 0)
    amper = 'PM'

  if (locale === 'id-ID') {
    const date = `${day} ${monthString} ${year}`
    const dateLong = `${day} ${monthStringLong} ${year}`
    const time = `${hour}.${minute} WIB`
    const full = `${day} ${monthString} ${year}, ${hour}.${minute} WIB`
    const fullLong = `${day} ${monthStringLong} ${year}, ${hour}:${minute}:${second} WIB`
    const plain = `${year}${month}${day}`

    return { date, dateLong, time, full, fullLong, plain }
  }
  else {
    const date = `${day} ${monthString} ${year}`
    const dateLong = `${day} ${monthStringLong} ${year}`
    const time = `${hourMod > 0 ? hourMod : hour}.${minute} ${amper}`
    const full = `${day} ${monthString} ${year}, ${hourMod > 0 ? hourMod : hour}.${minute} ${amper}`
    const fullLong = `${day} ${monthStringLong} ${year}, ${hourMod > 0 ? hourMod : hour}:${minute}:${second} ${amper}`
    const plain = `${year}${month}${day}`

    return { date, dateLong, time, full, fullLong, plain }
  }
}
