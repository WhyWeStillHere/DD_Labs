#!/bin/sh
PID_DATA="$(pwd)/__monitor_pid_data.txt"
LOG="$(pwd)/__monitor_log.txt"
case "$1" in
    "START")
        if [ -f $PID_DATA ];
        then
            echo "Monitor already in work"
        else
            bash process_work.sh RUN &
            monitor_pid=$!
            echo $monitor_pid
            echo $monitor_pid > $PID_DATA
        fi
        ;;
    "STOP")
        if [ ! -f $PID_DATA ];
        then
            echo "Monitor is not started"
        else
            monitor_pid=$(cat $PID_STORE)
            echo $monitor_pid
            kill $monitor_pid
            rm $PID_DATA
        fi
        ;;
    "STATUS")
        if [ ! -f $PID_DATA ];
        then
            echo "Monitoring stopped"
        else
            monitor_pid=$(cat $PID_DATA)
            if [ -r "/proc/$monitor_pid" ]
            then
                echo "Monitor running"
            else
                echo "Invalid monitor storage"
            fi
        fi
        ;;
    "RUN")
        while true
        do
            memory_stats=$(awk '/^Mem/ {printf("%u;%u;%.f%%\n", $2, $3, $3/$2*100)}' <(free -m))
            timestamp=$(date +"%T")
            echo "$timestamp;$memory_stats" >> $LOG
            sleep 10
        done
        ;;
    *)
        echo "Invalid command"
        ;;
esac
