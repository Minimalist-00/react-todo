import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { CsrfToken } from '../types'
import useStore from '../store'

export const useError = () => {
  const navigate = useNavigate()
  const resetEditedTask = useStore((state) => state.resetEditedTask)
  const getCsrfToken = async () => {
    const { data } = await axios.get<CsrfToken>(
      `${process.env.REACT_APP_API_URL}/csrf`
    )
    axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token
  }
  // エラーメッセージによって処理を分岐
  const switchErrorHandling = (msg: string) => {
    // 引数のmsgはエラーメッセージ
    switch (msg) {
      case 'invalid csrf token':
        getCsrfToken() // 再度csrf tokenを取得
        alert('CSRFトークンが無効です。もう一度お試しください。')
        break
      case 'invalid or expired jwt': // jwtが不正または期限切れ
        alert(
          'アクセストークンが有効ではありません。再度ログインしてください。'
        )
        resetEditedTask()
        navigate('/')
        break
      case 'missing or malformed jwt': // jwtがないまたは不正
        alert(
          'アクセストークンが存在しないか、形式が正しくありません。再度ログインしてください。'
        )
        resetEditedTask()
        navigate('/')
        break
      case 'duplicated key not allowed': // 重複したkeyは許可されない
        alert('emailアドレスが既に登録されています')
        break
      case 'crypto/bcrypt: hashedPassword is not the hash of the given password': // パスワードが一致しない
        alert('パスワードが間違っています')
        break
      case 'record not found': // レコードが見つからない
        alert('emailアドレスが間違っています')
        break
      default:
        alert(msg)
    }
  }
  return { switchErrorHandling }
}
