import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import useStore from '../store'
import { Credential } from '../types'
import { useError } from '../hooks/useError'

/* useMutationを使ってログイン、サインアップ、ログアウトの処理を実装 */
export const useMutateAuth = () => {
  const navigate = useNavigate()
  const resetEditedTask = useStore((state) => state.resetEditedTask) // storeのresetEditedTaskを取得
  const { switchErrorHandling } = useError()

  /* 非同期｜各エンドポイントにアクセス｜エラーハンドリング */
  const loginMutation = useMutation(
    async (
      user: Credential // 引数でEmailとPasswordを受け取る
      // axios.postメソッドでログインのAPIを叩く
    ) => await axios.post(`${process.env.REACT_APP_API_URL}/login`, user),
    {
      onSuccess: () => {
        navigate('/todo') // todoページに遷移
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          // csfrのエラーだけは.messageの階層にある
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  const signupMutation = useMutation(
    async (user: Credential) =>
      await axios.post(`${process.env.REACT_APP_API_URL}/signup`, user),
    {
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  const logoutMutation = useMutation(
    async () => await axios.post(`${process.env.REACT_APP_API_URL}/logout`),
    {
      onSuccess: () => {
        resetEditedTask() // storeのeditedTaskを初期化
        navigate('/') // ログアウト後はログインページに遷移
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  return { loginMutation, signupMutation, logoutMutation }
}
