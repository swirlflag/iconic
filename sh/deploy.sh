#!/bin/bash
# 참고 링크 https://confluence.nexon.com/pages/viewpage.action?pageId=888335810

export $(grep -v '^#' .env.live | xargs)
PROJECTNAME=$NUXT_PUBLIC_NAME
DEPLOY_GIT_PATH=$NUXT_PUBLIC_NEXON_DEPLOY_GIT_REMOTE
DEPLOY_PIPELINE_LINK="$NUXT_PUBLIC_NEXON_DEPLOY_GIT_REMOTE"/-/pipelines
unset $(grep -v '^#' .env.live | cut -d '=' -f 1 | xargs)

# 소스 경로 저장
SOURCE_PATH=$(cygpath -w $(pwd -P))
DEFAULT_COMMIT_MESSAGE="[$(git rev-parse --short=8 HEAD)] $(git log -1 --pretty=%B)"

echo -e "\033[0;33m~ $PROJECTNAME 프론트 웹 배포 프로세스가 시작됩니다. ~\n\033[0m"

GIT_STATUS=$(git status --porcelain);
if [ -n "$GIT_STATUS" ]; then
    echo -e "\033[0;31m!!! 주의: 지금 배포하려는 소스는 커밋되지 않은 소스임이 감지되었습니다. !!!\n\033[0m"
fi

echo -e "\033[0;33m배포할 브랜치를 선택해주세요.\nlive 배포는 gitlab에서 진행해주세요.\033[0m"
PS3="배포할 브랜치의 숫자를 입력후 Enter를 눌러주세요 : "
options=("stg (stage)" "master (pre)" "취소")
select choice in "${options[@]}"; do
    case $REPLY in
        1)
            echo -e "\033[0;32mstg 브랜치가 선택 되었습니다.\033[0m"
            BRANCH_NAME=stg
            break
            ;;
        2)
            echo -e "\033[0;32mmaster 브랜치가 선택 되었습니다.\033[0m"
            BRANCH_NAME=master
            break
            ;;
        3)
            echo -e "\033[0;33m배포가 취소되었습니다.\033[0m"
            echo -e "\033[0;33m\n~ $PROJECTNAME 프론트 웹 배포 프로세스가 종료되었습니다. ~\033[0m"
            exit
            break
            ;;
        *)
            echo -e '\033[0;33m유효하지 않은 선택입니다. 올바른 번호를 입력후 Enter를 눌러주세요.\033[0m'
            ;;
    esac
done

echo -e '\033[0;33m\n배포 커밋 메세지를 입력해주세요.\n아무것도 입력하지 않으면, 자동으로 아래 메세지가 입력됩니다.\033[0m'
echo -e "\033[0;34m$DEFAULT_COMMIT_MESSAGE\033[0m"

read -p "Commit Message : " -e input_message
COMMIT_MESSAGE="${input_message:-$DEFAULT_COMMIT_MESSAGE}"

while true; do
    echo -e "\033[0;32m\n선택된 브랜치 : $BRANCH_NAME\n입력된 커밋 메세지 : $COMMIT_MESSAGE\033[0m"
    read -p "이 설정으로 배포를 시작하시겠습니까? (y/n): " answer
    case $answer in
        [Yy]*)
            result=true
            echo -e "\033[0;33m\n위 설정으로 배포가 시작됩니다.\n\033[0m"
            break
            ;;
        "")
            result=false
            ;;
        *)
            echo -e "\033[0;33m배포가 취소되었습니다.\033[0m"
            echo -e "\033[0;33m\n~ $PROJECTNAME 프론트 웹 배포 프로세스가 종료되었습니다. ~\033[0m"
            exit 1;
            ;;
    esac
done

# 배포 경로 생성 및 이동
cd ..
RANDOM_FOLDER_NAME=$(date | md5sum | awk '{print $1}')
mkdir $RANDOM_FOLDER_NAME
echo -e "\033[0;33m생성된 가상 배포 폴더명 => $RANDOM_FOLDER_NAME\033[0m"

cd $RANDOM_FOLDER_NAME
TARGET_PATH=$(cygpath -w "$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )")
echo -e "\033[0;33m가상 배포 폴더 위치($TARGET_PATH)로 이동합니다.\033[0m"

#이후 작업중 오류 발생시, 랜덤 생성된 디렉토리 제거
handle_error() {
    cd $SOURCE_PATH
    rm -rf $TARGET_PATH
    echo -e "\033[0;31m오류 발생으로 배포 프로세스가 종료됩니다.\033[0m"
    echo -e "\033[0;33m\n~ $PROJECTNAME 프론트 웹 배포 프로세스가 종료되었습니다. ~\033[0m"
    exit 1
}
trap handle_error ERR

# 배포 프로젝트 클론
echo -e "\033[0;33m배포 리포지토리 git clone을 시작합니다...\033[0m"
git clone --branch $BRANCH_NAME $DEPLOY_GIT_PATH $TARGET_PATH

REMOTE_LAST_COMMIT=$(git rev-parse $BRANCH_NAME)
REMOTE_LAST_COMMIT_TIME=$(git show -s --format=%ct $REMOTE_LAST_COMMIT)
REMOTE_LAST_COMMIT_MESSAGE=$(git show -s --format=%s $REMOTE_LAST_COMMIT)
REMOTE_LAST_COMMIT_AUTHOR_NAME=$(git show -s --format=%an $REMOTE_LAST_COMMIT)
REMOTE_LAST_COMMIT_TIME_FORMAT=$(date -d @$REMOTE_LAST_COMMIT_TIME "+%Y-%m-%d %H:%M:%S")

CURRENT_TIME=$(date +%s)
time_difference=$((CURRENT_TIME - REMOTE_LAST_COMMIT_TIME))
time_difference_minute=$(((CURRENT_TIME - REMOTE_LAST_COMMIT_TIME) / 60 ))
time_threshold=1200

if [ $time_difference -lt $time_threshold ]; then
    echo -e "\033[0;31m!!! 주의: $time_difference_minute 분 전에 배포 이력이 있습니다. 아직 이전의 배포가 진행중일 수 있으니 확인 후 진행해주세요. !!!\033[0m"
    echo -e "\033[0;34m배포 시간: $REMOTE_LAST_COMMIT_TIME_FORMAT\033[0m"
    echo -e "\033[0;34m작성자: $REMOTE_LAST_COMMIT_AUTHOR_NAME\033[0m"
    echo -e "\033[0;34m커밋 메세지: $REMOTE_LAST_COMMIT_MESSAGE\033[0m"
    echo -e "\033[0;33m~ remote pipeline 링크 : $DEPLOY_PIPELINE_LINK ~\n\033[0m"
    while true; do
        read -p "배포를 계속 진행할까요? (y/n): " answer
        case $answer in
            [Yy]*)
                result=true
                break
                ;;
            "")
                result=false
                ;;
            *)
                cd $SOURCE_PATH
                rm -rf $TARGET_PATH
                echo -e "\033[0;33m배포가 취소되었습니다.\033[0m"
                echo -e "\033[0;33m가상 배포 폴더가 삭제되었습니다.\033[0m"
                echo -e "\033[0;33m\n~ $PROJECTNAME 프론트 웹 배포 프로세스가 종료되었습니다. ~\033[0m"
                exit 1;
                ;;
        esac
    done
fi

echo -e "\033[0;33m배포 리포지토리 git clone이 완료되었습니다.\033[0m"

# 빌드에 필요한 파일 또는 폴더를 복사
EXCLUDE_LIST=(".git" "node_modules" ".gitlab-ci.yml" ".nuxt" "README.md" "deploy.sh" ".output" ".next");
#기존 파일 삭제
echo -e "\033[0;33m가상 배포 폴더에 타겟 소스를 복사중입니다...\033[0m"
for item in $(find $TARGET_PATH -mindepth 1 -maxdepth 1); do
    item_name=$(basename "$item")
    if ! [[ " ${EXCLUDE_LIST[@]} " =~ " ${item_name} " ]]; then
        rm -rf "$item"
    fi
done
#소스 파일 복사
for item in $(find $SOURCE_PATH -mindepth 1 -maxdepth 1); do
    item_name=$(basename "$item")
    if ! [[ " ${EXCLUDE_LIST[@]} " =~ " ${item_name} " ]]; then
        cp -r "$item" $TARGET_PATH
    fi
done

echo -e "\033[0;33m가상 배포 폴더에 타겟 소스 복사 완료\n\033[0m"

# 변경 사항 커밋 및 푸시
git add .

old_revision="HEAD"
new_revision=""
trashfile="re-deploy-trash.txt"

if git diff --cached --quiet $old_revision $new_revision; then
    echo -e "\033[0;33m 마지막으로 배포된 버전과 동일한 소스임이 감지되었습니다. \n\033[0m"
    while true; do
        read -p "해당 버전으로 재배포를 진행할까요? (y/n): " answer
        case $answer in
            [Yy]*)
                if [ -e "$trashfile" ]; then
                    rm "$trashfile"
                else
                    touch "$trashfile"
                fi
                git add .
                result=true
                break
                ;;
            "")
                result=false
                ;;
            *)
                cd $SOURCE_PATH
                rm -rf $TARGET_PATH
                echo -e "\033[0;33m배포가 취소되었습니다.\033[0m"
                echo -e "\033[0;33m가상 배포 폴더가 삭제되었습니다.\033[0m"
                echo -e "\033[0;33m\n~ $PROJECTNAME 프론트 웹 배포 프로세스가 종료되었습니다. ~\033[0m"
                exit 1;
                ;;
        esac
    done
fi

# commit, push
git commit -m "$COMMIT_MESSAGE"
git push origin $BRANCH_NAME
echo -e "\033[0;33m배포 리포지토리에 push 완료!\033[0m"

# 최종 완료시 배포 프로젝트 삭제
cd $SOURCE_PATH
rm -rf $TARGET_PATH
echo -e "\033[0;33m가상 배포 폴더가 삭제되었습니다.\033[0m"
echo -e "\033[0;33m\n~ $PROJECTNAME 프론트 웹 배포 프로세스가 종료되었습니다. ~\033[0m"
