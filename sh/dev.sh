echo -e "\033[0;33mnpm run dev\n실행 환경을 선택해 주세요.\033[0m"
PS3="실행 환경의 숫자 입력 : "
options=("stage (stg, qa)" "live (pre)" "local custom (로컬 전용, .env.local 파일 필요)" "취소")

select choice in "${options[@]}"; do
    case $REPLY in
        1)
            export $(grep -v '^#' .env.stage | xargs)
            URL=$NUXT_PUBLIC_LIVE_URL
            unset $(grep -v '^#' .env.live | cut -d '=' -f 1 | xargs)
            echo -e "\033[38;5;27m🧪 stage 환경으로 dev를 시작합니다.\n.env.stage가 적용됩니다.\n즐거운 개발 되세요.\n\033[0m"
            env-cmd -f .env.stage nuxt dev --https --ssl-cert nexon.com.pem --ssl-key nexon.com-key.pem --port 443 --host $URL
            exit
            break
            ;;
        2)
            export $(grep -v '^#' .env.live | xargs)
            URL=$NUXT_PUBLIC_LIVE_URL
            unset $(grep -v '^#' .env.live | cut -d '=' -f 1 | xargs)
            echo -e "\033[0;32m📺 live 환경으로 dev를 시작합니다.\n.env.live가 적용됩니다.\n즐거운 개발 되세요.\n\033[0m"
            env-cmd -f .env.live nuxt dev --https --ssl-cert nexon.com.pem --ssl-key nexon.com-key.pem --port 443 --host $URL
            exit
            break
            ;;
        3)
            if [ ! -f .env.local ]; then
                echo -e "\033[0;31m.env.local 파일을 찾을 수 없습니다. 파일을 생성후 다시 시도해주세요.\n.env.local은 기본적으로 gitignore 처리되어 있습니다.\nnpm run dev가 종료 되었습니다.\033[0m"
                exit 1
            fi
            export $(grep -v '^#' .env.local | xargs)
            URL=$NUXT_PUBLIC_LIVE_URL
            unset $(grep -v '^#' .env.local | cut -d '=' -f 1 | xargs)
            echo -e "\033[0;33m📺 custom 환경으로 dev를 시작합니다.\n.env.local이 적용됩니다.\n즐거운 개발 되세요.\n\033[0m"
            env-cmd -f .env.local nuxt dev --https --ssl-cert nexon.com.pem --ssl-key nexon.com-key.pem --port 443 --host $URL
            exit
            break
            ;;
        4)
            echo -e "\033[0;33mnpm run dev가 취소 되었습니다.\033[0m"
            exit
            break
            ;;
        *)
            echo -e '\033[0;33m유효하지 않은 선택입니다. 올바른 번호를 입력후 Enter를 눌러주세요.\033[0m'
        ;;
    esac
done